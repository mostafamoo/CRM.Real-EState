# Estata CRM

A modern, full-featured real estate CRM. Built with Next.js 16, Drizzle ORM, SQLite, and Tailwind CSS.

## Features

**CRM**
- Leads, Deals, Listings, Contacts with full CRUD, search, filters, sort
- Lead scoring (Cold / Warm / Hot / Burning) with rationale breakdown
- Lead → Listing matching by budget and city
- Tags, custom fields, saved views

**Operations**
- Showings with feedback and ratings
- Open houses with attendee sign-in (auto-creates leads)
- Commissions tracker (GCI, splits, payouts)
- Documents with multi-signer e-sign flow

**Communications**
- Unified Inbox: Email / SMS / Call / WhatsApp threads
- Activity feed across the whole workspace
- Comments + @mentions on leads / deals / listings

**Marketing**
- Campaigns with metrics
- Multi-step Sequences (drip campaigns)
- Microsite editor with live preview
- Public lead capture forms with embed code
- Buyer/Seller portal

**Sales analytics**
- Dashboard with stats and pipeline performance chart
- Sales forecasting (weighted by stage probability)
- Goal tracking and source conversion analysis
- Top agents leaderboard

**System**
- Real authentication (signup / login / sessions via JWT cookies)
- Multi-tenant (organization isolation)
- Integrations toggles (Zillow, MLS, DocuSign, Slack, Twilio, etc.)
- Automation rules
- Tasks and Calendar
- Plan management (Starter / Pro / Enterprise) with billing
- AI Copilot floating assistant
- PWA-ready

## Tech stack

- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Radix UI + Lucide icons
- **Backend**: Server Actions + JWT sessions + bcrypt
- **Database**: SQLite via Drizzle ORM (easy migration path to Postgres / Turso)
- **State**: Zustand (UI cache, server is source of truth)
- **Charts**: Recharts
- **Toasts**: Sonner

## Getting started

### Prerequisites

- Node.js 20.9+
- npm

### Setup

```bash
# Install dependencies
npm install

# Push the schema to a local SQLite database
npm run db:push

# (Optional) Seed a demo workspace
npm run db:seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo credentials

If you ran `npm run db:seed`:

- **Email**: `tl@tl.com`
- **Password**: `12345678`

Or create a fresh account at `/register` — your workspace will be auto-seeded with sample data.

## Environment variables

For production, set:

```bash
JWT_SECRET=<a-random-32-char-secret>
DATABASE_URL=<path-or-connection-string>
```

The local default uses `./estata.db`.

## Project structure

```
src/
├── app/                     # Next.js routes (App Router)
│   ├── (app)/               # Authenticated app pages
│   ├── (auth)/              # Login / Register
│   └── onboarding/          # Plan selection
├── components/
│   ├── ui/                  # Primitives (Button, Card, Dialog, ...)
│   ├── dialogs/             # Form dialogs (Lead, Deal, Listing, ...)
│   ├── layout/              # Sidebar, topbar, copilot, hydration
│   └── common/              # Tables, charts, tag picker, ...
├── lib/
│   ├── db/                  # Drizzle schema + client
│   ├── actions/             # Server actions (auth + CRM)
│   ├── auth.ts              # Sessions, JWT, password hashing
│   ├── store.ts             # Zustand store + optimistic updates
│   ├── types.ts             # Shared types
│   └── scoring.ts           # Lead scoring + listing matching
└── proxy.ts                 # Auth middleware (Next.js 16 "proxy")
```

## License

Private — all rights reserved.
