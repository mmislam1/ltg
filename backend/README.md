# LTG NestJS API

NestJS/TypeScript API backed by MongoDB. Authentication uses a 15-minute access JWT and a rotating 7-day refresh JWT. Only a SHA-256 digest of the active high-entropy refresh token is stored, enabling atomic replay protection.

## Start with Docker

1. Copy `.env.example` to `.env` and replace both JWT secrets.
2. Run `docker compose up --build`.
3. Check `http://localhost:8000/api/health`.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
npm run start:dev
```

MongoDB must be available at the `MONGODB_URI` in `.env`.

## Authentication endpoints

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/refresh`
- `POST /api/auth/logout` (Bearer access token)
- `GET /api/auth/me` (Bearer access token)
- `PATCH /api/auth/me` (Bearer access token)

## Food endpoints

- `GET /api/foods` — approved foods for everyone; authenticated creators also receive their own pending foods
- `POST /api/foods` — create a pending food (Bearer access token)
- `GET /api/foods/pending` — list every pending food (admin only)
- `PATCH /api/foods/:id/approve` — approve a pending food (admin only)
- `DELETE /api/foods/:id` — delete a food (its creator or an admin)

New accounts have the `user` role. Promote an account through MongoDB when an admin is needed:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

## Meal activity endpoints

All meal activity endpoints require a Bearer access token. They use the user's IANA
`timezone` profile value (default: `Asia/Dhaka`) to determine the current local date.
Passing `?date=YYYY-MM-DD` selects a historical or future local date explicitly.

- `GET /api/meal-activities` — get or create the activity for the selected date
- `PATCH /api/meal-activities/daily` — update daily water and step totals
- `POST /api/meal-activities/meals` — add one Breakfast, Lunch, Dinner, or Snack
- `PATCH /api/meal-activities/meals/:mealType` — replace an existing meal's food list

Meal bodies use `list: [{ "foodId": "<Mongo ObjectId>", "quantity": 100 }]`.
Only approved foods and the authenticated user's own pending foods may be selected.
Each user can have only one meal of each type per date.

## Diet chart email export

`POST /api/diet-chart-exports/requests?date=YYYY-MM-DD` creates a PDF email request for
the authenticated member. The date is optional and follows the same timezone-aware
behavior as meal activities. Requests are limited to three per minute per client.

Admins can review pending requests with `GET /api/diet-chart-exports/requests` and
generate and email the chart with
`PATCH /api/diet-chart-exports/requests/:requestId/approve`.

## Admin dashboard

All admin endpoints require an authenticated account with the `admin` role.

- `GET /api/admin/dashboard` — member totals, purchase totals, pending request counts,
  member records, and the last 12 months of new account counts
- `PATCH /api/admin/members/:memberId/purchase` — set or remove the member's manual
  purchase tag with `{ "purchased": true | false }`

Configure SMTP with `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`,
`MAIL_PASSWORD`, and `MAIL_FROM`. `MAIL_USER` and `MAIL_PASSWORD` may both be omitted
for an SMTP relay that does not require authentication.

When production runs with automatic index creation disabled, create the activity key once:

```javascript
db.meal_activities.createIndex({ userId: 1, date: 1 }, { unique: true })
```

## Food unit contract

`unit` is restricted to `g`, `ml`, `pc`, or `slice` (`piece` is normalized to `pc`). `nutritionPer` states how many of that unit the nutrition object describes. For example, `unit: "g"` with `nutritionPer: 100` means every nutrition value is per 100 g; meal quantities are scaled by `quantity / nutritionPer`.

- Calories: kcal
- Protein, total carbs, fiber, net carbs, and fats: g
- Vitamins B1, B2, B3, B5, B6, B8, C, and E: mg
- Vitamins B7, B9, B12, and K: µg
- Vitamin A: µg RAE
- Vitamin D: IU
- Minerals: mg, except selenium in µg

The authoritative source is `seeds/foods.raw.json`; its measurement units are validated and normalized by `npm run seed:export`, which creates the Mongo-ready `seeds/foods.seed.json`.

The supplied source labels B7/biotin as mg even though its values are microgram-scale (including 30 for the multivitamin). The exporter records B7 as µg. Vitamin A is labeled µg RAE to match the standard dietary convention.

If an older system catalog was imported, replace only those system records before importing the regenerated seed. User-created foods are not touched:

```javascript
db.foods.deleteMany({ addedBy: "system" })
```

```powershell
mongoimport --uri "mongodb://localhost:27017/ltg" --collection foods --file seeds/foods.seed.json --jsonArray
```
