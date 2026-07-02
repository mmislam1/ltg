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
