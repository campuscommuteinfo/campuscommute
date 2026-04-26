# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack on port 9002
npm run build        # Production build
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix linting issues
npm run typecheck    # TypeScript type checking (no emit)
npm run genkit:dev   # Start Genkit AI dev server
npm run genkit:watch # Genkit with hot reload
```

There are no automated tests — verify features manually by running the dev server.

## Architecture

**Campus Commute** is an AI-powered campus ride-pooling app for Knowledge Park, Greater Noida. Built as a Next.js 15 fullstack app with Firebase backend.

**Core stack:** React 19 + Next.js App Router, TypeScript, TailwindCSS, Radix UI / shadcn/ui, Firebase (Auth + Firestore), Google Genkit 1.14 with Gemini 2.0 Flash, Google Maps API.

### Data flow pattern

- **Reads:** Firebase client SDK with `onSnapshot` listeners for real-time updates (vehicles, rides, user points)
- **Writes (sensitive):** Next.js Server Actions in `src/app/actions/` using Firebase Admin SDK — prevents client-side fraud for wallet, rewards, and SOS operations
- **Auth:** Firebase Google OAuth (popup with redirect fallback), browser session persistence

### Route structure

| Path | Purpose |
|------|---------|
| `/` | Public landing page |
| `/login` | Google OAuth |
| `/dashboard/*` | Protected user area (auth-gated in `CommuteDashboard`) |
| `/dashboard/ride/[id]` | Dynamic ride details with chat |
| `/admin/*` | Role-gated admin panel (`role === 'admin'` in Firestore user doc) |

Route protection: unauthenticated users are redirected by `CommuteDashboard` component; admin routes check `role` field in Firestore plus a dev email fallback.

### Key directories

- `src/app/actions/` — Server Actions (walletActions, rewardsActions, sosActions, metricsActions) — always use admin SDK here
- `src/ai/flows/` — Genkit AI flows (crowd prediction, delay explanation, fare suggestion) — schema-defined with Zod
- `src/lib/firebase.ts` — Client SDK init; `src/lib/firebase-admin.ts` — Admin SDK init
- `src/lib/types.ts` — All shared TypeScript interfaces
- `src/components/ui/` — 34 shadcn/ui primitives (do not modify directly)
- `src/components/admin/` — Admin-only components

### Firestore collections

`users`, `vehicles`, `rides`, `ride_requests`, `redeemed_vouchers`, `vehicle_reports`, `sos_alerts`, `stops`, `transactions`

### Environment variables

**Client-side** (prefixed `NEXT_PUBLIC_`): Firebase config keys + Google Maps key (exposed via `next.config.ts` env transform from `GOOGLE_MAPS_API_KEY`).

**Server-side only**: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (multi-line, use `\n` escaping in `.env.local`).

### Non-obvious patterns

- **Race condition prevention:** Components use `isMounted` ref + `isProcessing` state to guard async operations
- **Wallet/rewards atomicity:** Server Actions use Firestore transactions via admin SDK for atomic point/balance updates
- **Mobile CSS:** Uses `env(safe-area-inset-*)`, `100dvh`, and 44px minimum touch targets throughout
- **`next.config.ts`** sets `Cross-Origin-Opener-Policy: same-origin-allow-popups` header required for Firebase Auth popups
