# Salam Cab — Backend API

Node.js + Express + MongoDB (Mongoose) API that stores bookings created on the
Salam Cab website and emails a confirmation to the client.

## Setup

```bash
cd backend
npm install
copy .env.example .env    # already provided with sane defaults for local dev
npm run dev                # nodemon, restarts on file changes
# or
npm start
```

Requires a running MongoDB instance. For local development:

```bash
# if you have MongoDB Community Server installed
mongod --dbpath <your-data-dir>
```

Or use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and paste
its connection string into `MONGODB_URI` in `.env`.

### Email

`SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` are optional. If left blank, the server
automatically creates a temporary [Ethereal](https://ethereal.email) test
inbox on first send — every confirmation email gets a preview URL printed in
the server console, so the whole booking → email flow works out of the box
for demos with **zero configuration**.

To send real emails (e.g. via Gmail), fill in `backend/.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=you@gmail.com
SMTP_PASS=<16-character App Password>
MAIL_FROM_NAME=Salam Cab
MAIL_FROM_ADDRESS=you@gmail.com
```

(Gmail requires an [App Password](https://myaccount.google.com/apppasswords),
not your normal login password.) Any standard SMTP provider works the same
way (SendGrid, Mailtrap, Amazon SES, etc.).

## Admin authentication

The `/admin` dashboard (separate app in `../admin`) logs in against a single
admin account provisioned from `backend/.env` — no user database/collection
is needed:

```
ADMIN_EMAIL=admin@salamcab.com
ADMIN_PASSWORD=SalamCab@123
JWT_SECRET=change-this-to-a-long-random-string-in-production
JWT_EXPIRES_IN=1d
```

Change these before deploying anywhere real. `POST /api/admin/auth/login`
returns a JWT that must be sent as `Authorization: Bearer <token>` on every
admin-only request below.

## API Endpoints

Base URL: `http://localhost:3000/api`

| Method | Endpoint                | Auth  | Description                                                          |
| ------ | ----------------------- | ----- | --------------------------------------------------------------------- |
| GET    | `/health`               | —     | Health check                                                          |
| POST   | `/admin/auth/login`     | —     | Admin login — returns a JWT                                          |
| POST   | `/admin/auth/logout`    | —     | Stateless logout (client discards the token)                         |
| GET    | `/admin/auth/me`        | Admin | Returns the logged-in admin's profile — used to restore sessions     |
| POST   | `/bookings`              | —     | Create a booking — saves to MongoDB and emails a confirmation        |
| GET    | `/bookings`              | Admin | List bookings (query: `phone`, `email`, `status`, `page`, `limit`)   |
| GET    | `/bookings/:id`          | Admin | Get a single booking by `bookingId` (e.g. `SC-12345`) or Mongo `_id` |
| PATCH  | `/bookings/:id/status`   | Admin | Update booking status (`pending` \| `confirmed` \| `cancelled`)      |
| PATCH  | `/bookings/:id/driver`   | Admin | Manually assign a driver (`driverName`, `driverPhone`) to a booking  |
| DELETE | `/bookings/:id`          | Admin | Permanently delete a booking                                         |
| POST   | `/contact`               | —     | Contact page form — emails the message directly to `admin@salamcabs.com` (no DB storage) |
| GET    | `/rate-card`             | —     | Combined, active-only snapshot of vehicles/routes/packages/surcharges for the booking form |

`POST /bookings` stays public so the customer-facing website can create
bookings without logging in. Everything else that reads or manages bookings
requires a valid admin JWT.

### Rate card management (Routes & Pricing)

The vehicle types, one-way routes, round-trip packages, and surcharges shown
on the booking form live in MongoDB and are managed from the admin panel's
"Routes & Pricing" page. `GET /api/rate-card` (public, active-only) is what
the booking form reads; everything under `/api/admin/rate-card/*` is
full CRUD and requires an admin JWT:

| Method | Endpoint                                    | Description                          |
| ------ | -------------------------------------------- | ------------------------------------- |
| GET/POST | `/admin/rate-card/vehicles`               | List / create vehicle types           |
| PATCH/DELETE | `/admin/rate-card/vehicles/:id`       | Update / delete a vehicle type        |
| GET/POST | `/admin/rate-card/one-way-routes`         | List / create one-way routes          |
| PATCH/DELETE | `/admin/rate-card/one-way-routes/:id` | Update / delete a one-way route       |
| GET/POST | `/admin/rate-card/round-trip-packages`    | List / create round-trip packages     |
| PATCH/DELETE | `/admin/rate-card/round-trip-packages/:id` | Update / delete a round-trip package |
| GET/POST | `/admin/rate-card/surcharges`             | List / create surcharges              |
| PATCH/DELETE | `/admin/rate-card/surcharges/:id`     | Update / delete a surcharge           |

The first time you set this up (or after a fresh database), run the seed
script once to migrate the original hardcoded rate card into MongoDB:

```bash
npm run seed:rate-card
```

It's safe to re-run — records are upserted by a natural key (vehicle slug,
`from`+`to` labels, package legs, surcharge key) instead of duplicated, so it
will never wipe out routes you've since added or edited from the admin panel.

### File uploads (vehicle photos)

| Method | Endpoint                             | Description                                          |
| ------ | ------------------------------------- | ----------------------------------------------------- |
| POST   | `/admin/uploads/vehicle-image`      | Upload a vehicle photo (JPG/PNG/WEBP/GIF, max 5MB) — requires admin JWT, returns `{ url }` |

Every vehicle image link stored in the database — whether uploaded through
this endpoint or one of the six default photos seeded above — is always a
**complete, absolute URL** (e.g. `http://localhost:3000/uploads/vehicles/...`
or `http://localhost:3000/images/vehicles/sedan.jpg`), never a relative path.
That's what makes the same link work from the frontend, the admin panel, and
booking-confirmation emails regardless of origin — the same contract you'd
get from a hosted CDN like Cloudinary or S3, but self-hosted with no external
account required. In production, set `BACKEND_PUBLIC_URL` (see `.env.example`)
so the stored links point at your real API domain instead of `localhost`.

Static file roots:
- `/uploads/*` → `backend/public/uploads/*` — admin-uploaded photos (git-ignored, user-generated)
- `/images/*` → `backend/public/images/*` — default photos that ship with the repo (git-tracked)

### POST /api/bookings — request body

```json
{
  "tripType": "oneWay",
  "tripTypeLabel": "One Way",
  "route": "Jeddah Airport → Makkah Hotel",
  "from": "jedAirport",
  "to": "makHotel",
  "date": "2026-08-10",
  "time": "14:30",
  "passengers": 3,
  "specialRequests": "",
  "jeddahHajjPickup": false,
  "hajjDropoff": false,
  "vehicle": "sedan",
  "vehicleName": "Standard Sedan",
  "fullName": "Ahmed Khan",
  "phone": "+966501234567",
  "email": "ahmed@example.com",
  "flightNo": "SV123",
  "paymentMethod": "cash",
  "basePrice": 245,
  "surcharge": 0,
  "totalPrice": 245
}
```

### POST /api/bookings — response

```json
{
  "success": true,
  "message": "Booking created successfully",
  "bookingId": "SC-48213",
  "booking": { "...": "full saved document" }
}
```

`paymentMethod` is fixed to `"cash"` (cash on arrival) — it is the only
payment method currently supported end to end.
