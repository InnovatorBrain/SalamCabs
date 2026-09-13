# Salam Cab — Frontend

Bilingual (English/Arabic) marketing and booking frontend for Salam Cab, built with React + Vite + Bootstrap 5.

## Pages

| Route | Page |
|-------|------|
| `/` | Home — hero, services, fleet, destinations, testimonials, FAQ |
| `/about` | About — company story, team, pillars, stats |
| `/contact` | Contact — message form, contact cards, map, working hours |
| `/booking` | Booking — trip details form, live summary, trust badges |

## Tech Stack

- React 19 + Vite + TypeScript
- Bootstrap 5 (plain CSS, LTR/RTL swap — no react-bootstrap)
- Framer Motion animations
- React Router v6 with lazy-loaded routes
- React Hook Form + Zod validation
- Axios API client with mock layer
- react-i18next (EN/AR, localStorage persistence, RTL layout)

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Folder Structure

```
src/
├── api/           # Axios client + booking/contact APIs (mocked)
├── components/
│   ├── layout/    # Navbar, Footer, PageLayout
│   └── ui/        # LanguageToggle, Toast, Accordion, ErrorBoundary
├── hooks/         # useDirection (RTL motion)
├── locales/       # en.json, ar.json — all UI copy
├── pages/         # Home, About, Contact, Booking
├── styles/        # SCSS theme overrides
└── utils/         # formatters, Zod schemas
```

## Translations

All user-facing text lives in `src/locales/en.json` and `src/locales/ar.json`.

To add a new string:

1. Add the key to both locale files
2. Use `const { t } = useTranslation()` and `t('your.key')` in components

Language toggle (EN/AR) in the navbar:

- Switches all UI text instantly
- Sets `dir="rtl"` and loads Bootstrap RTL CSS for Arabic
- Persists choice in `localStorage` (`salam-cab-lang`)
- Swaps font: Poppins (EN) → Cairo (AR)

## API / Mock Layer

Set `VITE_USE_MOCK=true` in `.env` (default). The mock layer simulates:

- Contact form submission (`POST /contact`)
- Booking submission (`POST /bookings`)
- Fare estimation (`POST /bookings/estimate`)

To connect a real backend, set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL` to your API.

## Assumptions

- **Images**: Placeholder photos from Unsplash used where Figma assets were not exported. Replace in `src/pages/*` with exported Figma PNG/SVG for pixel-perfect match.
- **Branding**: "Salam Cab" used consistently (design had mixed "Hala Taxi" / "Salam Cab" in some frames).
- **Currency**: SAR with locale formatting (`en-SA` / `ar-SA`).
- **No auth**: Sign-in/sign-up flows excluded per requirements.
- **Booking flow**: Step 1 (Trip Details) fully implemented; steps 2–3 shown in stepper UI only.
- **Map**: Google Maps embed centered on Makkah.

## Responsive Breakpoints

- Mobile: 320px+ (stacked columns, collapsible navbar)
- Tablet: 768px+
- Desktop: 992px+ / 1200px+

## Accessibility

- Semantic HTML5 landmarks
- Form labels and inline validation messages
- `aria-live` region for language change announcements
- Keyboard-navigable accordion and forms
