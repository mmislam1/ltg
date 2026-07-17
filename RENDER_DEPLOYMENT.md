# Render deployment

This repo is a monorepo with two Render web services:

- `ltg-api`: NestJS backend from `backend/`
- `ltg-web`: Next.js frontend from `frontend/`

The root `render.yaml` can create both services as a Render Blueprint.

## Required backend values

Render does not provide MongoDB, so use a MongoDB Atlas connection string for:

```env
MONGODB_URI=mongodb+srv://...
```

In MongoDB Atlas, also allow network access from Render. For a quick free-tier setup,
allow `0.0.0.0/0`; for a tighter production setup, use Render's outbound IP options
for the backend service.

For diet chart PDF emails, provide SMTP values on the `ltg-api` service:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=Lose To Gain <your-email@gmail.com>
```

For Gmail, `MAIL_PASSWORD` must be a Google App Password, not the normal account password.

## Automatic values

The Blueprint generates:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

The Blueprint also wires:

- backend `CORS_ORIGINS` from the frontend Render hostname
- frontend `NEXT_PUBLIC_API_HOSTNAME` from the backend Render hostname

Because Render Blueprints do not support string interpolation, the app code converts those hostnames into:

- `https://<frontend-hostname>` for CORS
- `https://<backend-hostname>/api` for API calls

## Manual Render setup without Blueprint

Backend service:

- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start:prod`
- Health Check Path: `/api/health`
- Environment: set all required backend values above

Frontend service:

- Root Directory: `frontend`
- Runtime: Node
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start -- -H 0.0.0.0 -p $PORT`
- Environment:

```env
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com/api
NEXT_PUBLIC_NUTRITION_LABEL_SCAN_ENABLED=false
```

If you use `NEXT_PUBLIC_API_URL`, set it before building the frontend because Next.js exposes `NEXT_PUBLIC_*` values at build time.
