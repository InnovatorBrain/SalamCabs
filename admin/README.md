# Salam Cab — Admin Dashboard

A standalone React + Vite + TypeScript app for managing bookings created on
the Salam Cab website. Talks to the `backend/` API over JWT-authenticated
requests.

## Setup

```bash
cd admin
npm install
npm run dev
```

Runs at [http://localhost:5175](http://localhost:5175). Requires the backend
API (`../backend`) to be running at `http://localhost:3000` (configurable via
`VITE_API_BASE_URL` in `.env`).

## Login

Uses the single admin account configured in `backend/.env`:

```
Email:    admin@salamcab.com   (ADMIN_EMAIL)
Password: SalamCab@123         (ADMIN_PASSWORD)
```

## Features

- **Login / Logout** — JWT stored in `localStorage`; session is restored on
  refresh via `GET /api/admin/auth/me`, and any `401` response automatically
  signs the admin out.
- **Bookings list** — paginated table of every booking pulled live from
  MongoDB, with search (phone or email) and a status filter.
- **Status management** — each booking has an inline status dropdown
  (`Pending` / `Confirmed` / `Cancelled`) that persists immediately via
  `PATCH /api/bookings/:id/status`, with optimistic UI + rollback on failure.
- **Booking detail page** — full trip, vehicle/pricing, contact, and
  confirmation-email information for a single booking (including a link to
  preview the confirmation email when running in demo/Ethereal mode).
