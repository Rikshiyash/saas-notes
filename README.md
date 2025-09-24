# Multi-Tenant SaaS Notes Application

This is a multi-tenant notes application built with Next.js, MongoDB, and hosted on Vercel, as per the assignment requirements.

## Features

- Multi-Tenancy with strict data isolation
- JWT-based Authentication
- Role-based Authorization (Admin, Member)
- Subscription Gating (Free vs. Pro plan)
- CRUD API for notes
- Minimalist React Frontend

## Multi-Tenancy Approach

This application uses a **shared schema with a `tenantId` column** for multi-tenancy.

- **Why this approach?** It is the simplest to implement and manage for a small to medium scale application. It avoids the complexity of managing multiple schemas or databases while still providing strong data isolation at the application level.
- **How it works:** Every major data model (`User`, `Note`) contains a `tenantId` field. All database queries are filtered by the `tenantId` of the currently authenticated user. This ensures that a user can only ever access data belonging to their own tenant. This logic is enforced in the API middleware and controllers.

## Running Locally

1.  **Clone the repository.**
2.  **Install dependencies:** `npm install`
3.  **Set up environment variables:** Create a `.env.local` file in the root and add your `MONGODB_URI` and `JWT_SECRET`.
4.  **Seed the database:** Run the dev server (`npm run dev`) and visit `http://localhost:3000/api/seed` in your browser one time.
5.  **Start the application:** `npm run dev`. The app will be available at `http://localhost:3000`.

## API Endpoints

- `GET /api/health`: Health check.
- `POST /api/auth/login`: User login.
- `POST /api/notes`: Create a note.
- `GET /api/notes`: List all notes for the current tenant.
- `DELETE /api/notes/:id`: Delete a specific note.
- `POST /api/tenants/:slug/upgrade`: (Admin only) Upgrade tenant subscription to Pro.

## Test Accounts

The password for all accounts is `password`.

- `admin@acme.test` (Admin, Tenant: Acme)
- `user@acme.test` (Member, Tenant: Acme)
- `admin@globex.test` (Admin, Tenant: Globex)
- `user@globex.test` (Member, Tenant: Globex)