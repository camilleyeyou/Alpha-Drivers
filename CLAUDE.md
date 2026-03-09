# CLAUDE.md — Alpha-Drivers

## Project Overview

Alpha-Drivers is a platform connecting clients with verified professional drivers in Cameroon. Clients book drivers by the hour, pay via Mobile Money (MTN MoMo / Orange Money), and funds are held in escrow until the service is completed.

## Tech Stack

- **Framework**: Next.js 14.1.0 (App Router), React 18, TypeScript 5.3
- **Styling**: Tailwind CSS 3.4 + shadcn/ui (Radix UI primitives) + CVA for variants
- **Database**: PostgreSQL via Supabase, Prisma 5.10 ORM
- **Auth**: Auth.js v5 (next-auth beta.25) with JWT strategy, phone + password login
- **Payments**: NotchPay API (MTN MoMo, Orange Money) with escrow system
- **Forms**: React Hook Form + Zod validation
- **Icons**: lucide-react
- **State**: Zustand, TanStack React Query
- **i18n**: Custom cookie-based system (French default, English optional)

## Commands

```bash
npm run dev          # Dev server on port 3000
npm run build        # prisma generate && next build
npm run lint         # ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database (no migration)
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed database (tsx prisma/seed.ts)
```

## Project Structure

```
app/
  (auth)/           # Login, register (client + driver)
  (dashboard)/      # Protected: dashboard, bookings, documents, profile
  (marketing)/      # Public: tarifs, FAQ, contact, privacy, terms
  bookings/         # Booking creation flow
  chauffeur/        # SEO city landing pages (static: douala, yaounde, limbe, buea)
  drivers/          # Driver listings by city, driver detail pages
  api/
    auth/           # Login, register, session endpoints
    admin/          # Admin driver verification
    avatar/         # Profile photo upload
    bookings/       # CRUD + lifecycle: pay, confirm, start, complete, release, cancel
    drivers/        # Driver search/listing
    payments/       # NotchPay webhook handler
    user/           # Profile update, document upload
components/
  ui/               # Base: Button, Card, Input, Label, Avatar, Badge, Select, Dialog, Tabs, Toast
  layout/           # Navbar, Footer, DemoBanner
  driver/           # DriverCard
  booking/          # BookingForm, BookingActions
  profile/          # ProfileEditForm
lib/
  auth.ts           # Auth.js config (JWT callbacks, session enrichment)
  auth-helpers.ts   # requireAuth(), requireRole(), getCurrentSession()
  db/prisma.ts      # Prisma client singleton
  i18n/             # Dictionaries (fr.ts, en.ts), context.tsx, index.ts
  payments/notchpay.ts  # initializePayment, createTransfer, verifyPayment, generateReference
  utils/index.ts    # formatCurrency, formatDate, formatPhone, calculateTotalAmount, etc.
  validators/       # Zod schemas
prisma/
  schema.prisma     # Full data model
  seed.ts           # Database seeder
```

## Key Patterns

### i18n

- **Server components**: `const t = await getServerDictionary()` from `@/lib/i18n`
- **Client components**: `const { t, locale, setLocale } = useTranslation()` from `@/lib/i18n/context`
- Dictionaries: `lib/i18n/dictionaries/fr.ts` (canonical type source) and `en.ts`
- Locale stored in cookie `lang`, detected from browser, default `"fr"`
- All user-facing strings must be in both dictionaries — never hardcode French or English

### Auth

- `requireAuth()` — API route guard, returns `{ session, error }`. If error, return it directly.
- `requireRole(roles)` — Same but checks `session.user.role` against allowed roles.
- Session includes: `user.id`, `user.role`, `user.driverId`, `user.driverStatus`
- Roles: `CLIENT`, `DRIVER`, `ADMIN`, `SUPER_ADMIN`

### API Routes

```ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  // ... business logic
  return NextResponse.json({ success: true, data });
}
```

- Validate with Zod: `schema.safeParse(body)`
- Return French error messages for user-facing APIs
- Use `NextResponse.json({ error: "..." }, { status: 4xx })`

### Components

- UI components in `components/ui/` use Radix UI + CVA + `React.forwardRef`
- `cn()` utility from `lib/utils` for merging Tailwind classes
- `"use client"` directive only where needed (forms, interactive state, hooks)
- Server components by default

### Booking Status Flow

```
PENDING → PAID → CONFIRMED → IN_PROGRESS → COMPLETED → RELEASED
   ↓        ↓        ↓
CANCELLED  CANCELLED CANCELLED
```

Each transition has a dedicated API endpoint at `/api/bookings/[id]/{action}`.

### Payments (NotchPay)

- `initializePayment({ amount, phone, reference, description })` — Charge client via MoMo
- `createTransfer({ amount, recipient, reference, description })` — Pay driver via MoMo
- `verifyPayment(reference)` — Check payment status
- `generateReference(prefix)` — Create unique ref like `esc_abc123`
- Webhook at `/api/payments/webhook` handles: `payment.complete`, `payment.failed`, `transfer.complete`, `transfer.failed`

## Database (Prisma Schema)

Key models: `User`, `Driver`, `Document`, `Booking`, `Transaction`, `Review`, `Message`, `CityPage`

Key enums:
- `UserRole`: CLIENT, DRIVER, ADMIN, SUPER_ADMIN
- `DriverStatus`: PENDING_PAYMENT, PENDING_VERIFICATION, VERIFIED, SUSPENDED, REJECTED
- `BookingStatus`: PENDING, PAID, CONFIRMED, IN_PROGRESS, COMPLETED, RELEASED, DISPUTED, CANCELLED, REFUNDED
- `TransactionType`: ESCROW_DEPOSIT, DRIVER_PAYOUT, PLATFORM_FEE, REFUND, REGISTRATION_FEE
- `City`: DOUALA, YAOUNDE, LIMBE, BUEA

## Environment Variables

Required: `AUTH_SECRET`, `DATABASE_URL`, `DIRECT_URL`

Important settings:
- `PLATFORM_COMMISSION_PERCENT=15` — Platform takes 15% of each booking
- `DRIVER_REGISTRATION_FEE=2000` — One-time driver fee in FCFA
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — For file storage (documents, avatars)
- `NOTCHPAY_SECRET_KEY` — Payment processing (commented out until production)

See `.env.example` for full list.

## Conventions

- Currency is XAF (FCFA). Use `formatCurrency()` from `lib/utils` to display.
- Phone numbers are Cameroon format (+237). Use `formatPhone()` to display.
- MTN prefixes: 67x, 68x, 650-654. Orange prefixes: 69x, 655-659.
- Path alias: `@/` maps to project root.
- All UI text must support FR and EN via the i18n dictionaries.
- French is the primary/default language.
- Error messages in API responses are in French.
