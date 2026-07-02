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
