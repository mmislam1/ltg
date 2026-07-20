# Lose To Gain

Live app: [https://losetogainnext.netlify.app/](https://losetogainnext.netlify.app/)

Lose To Gain is a diet chart and nutrition tracking web app. Members can build daily meal plans, track progress, create custom foods and recipes, and request a PDF copy of their diet chart.

## Features

- Member authentication with profile-based nutrition targets.
- Daily meal tracking for breakfast, lunch, dinner, and snacks.
- Searchable food library with portion controls and calorie/macronutrient summaries.
- Custom food creation with admin approval before items become shared.
- Custom recipe creation from existing foods, with nutrition calculated per serving.
- Nutrition dashboard with daily macro and micronutrient breakdowns.
- Water, steps, weight, and progress tracking.
- Diet chart PDF request flow with admin approval and email delivery.
- Admin dashboard for member purchase tracking, pending approvals, PDF requests, and food management.
- Admin food management for editing, deleting, approving, or canceling approval for foods and recipes.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Redux Toolkit, Tailwind CSS.
- Backend: NestJS, TypeScript, MongoDB, Mongoose.
- PDF/email: server-generated diet chart PDFs with mail delivery support.
- Deployment: Netlify frontend with a Render-ready backend configuration.

## Project Structure

```text
frontend/   Next.js app
backend/    NestJS API
render.yaml Render deployment configuration
```

## Local Development

Install and run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Install and run the backend:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run start:dev
```

The backend requires MongoDB and the environment variables described in `backend/README.md`.
