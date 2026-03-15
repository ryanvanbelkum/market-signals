# AGENTS.md

## Project Overview
- App name: `Market Signals`
- Product: a local-market intelligence terminal for B2B sales triggers
- Frontend: `Next.js` App Router with `TypeScript`
- Data layer: `Postgres` via Supabase using the `postgres` npm client
- Deployment: Vercel

## Core Principles
- Do not add or reintroduce mock data, fallback fixtures, or fake seed content into the product experience.
- Prefer real database-backed behavior. If data is unavailable, show clear empty states or explicit errors.
- Keep the truth layer deterministic and auditable. Avoid “magic” scoring or hidden side effects.
- Preserve the current visual direction: sleek, modern, high-contrast, and intentional. Avoid generic default UI.

## Repo Conventions
- Main app code lives in [`/Users/ryanvanbelkum/repos/local-markets/src/app`](/Users/ryanvanbelkum/repos/local-markets/src/app).
- Shared UI components live in [`/Users/ryanvanbelkum/repos/local-markets/src/components`](/Users/ryanvanbelkum/repos/local-markets/src/components).
- Market Signals domain types and repository code live in [`/Users/ryanvanbelkum/repos/local-markets/src/lib/market-signals`](/Users/ryanvanbelkum/repos/local-markets/src/lib/market-signals).
- Database connection setup lives in [`/Users/ryanvanbelkum/repos/local-markets/src/lib/postgres.ts`](/Users/ryanvanbelkum/repos/local-markets/src/lib/postgres.ts).
- Global visual system lives in [`/Users/ryanvanbelkum/repos/local-markets/src/app/globals.css`](/Users/ryanvanbelkum/repos/local-markets/src/app/globals.css).

## Working Rules
- Use `Next.js` server components by default unless client behavior is actually needed.
- Keep API routes internal and minimal. Add public-facing APIs only if explicitly requested.
- Prefer extending the repository layer instead of querying Postgres directly from pages or components.
- When adding new persistence behavior, create tables or schema changes deliberately and keep naming aligned with the existing canonical models.
- Do not expose secrets, connection strings, or raw env var values in logs, code, or responses.
- Treat Supabase/Postgres connectivity issues as real operational problems. Do not paper over them with fake data.

## UI And Design Expectations
- Maintain the premium dashboard feel already established in the shell and global styles.
- Favor strong typography, clean spacing, high signal-to-noise layouts, and restrained accent colors.
- Reuse existing panel, card, shell, and empty-state patterns before introducing new one-off layouts.
- Keep mobile responsiveness in mind for every layout change.

## Data And Product Expectations
- The main entities today are market signals, digests, saved views, source connectors, entities, and promotion events.
- New ingestion or scoring work should fit the existing canonical model before introducing new tables or formats.
- If a data source is incomplete or unavailable, prefer showing “no data yet” over inventing sample records.
- Any future scoring, lead promotion, or digest logic should remain explainable from stored data.

## Verification
- Run `npm run lint` after meaningful changes.
- Run `npm run build` before handing off substantial work.
- If local build output shows database host resolution issues, note that clearly rather than masking it.

## Good First Extensions
- Add real ingestion jobs that populate `market_signals` and related tables.
- Improve empty states and loading states without introducing fake records.
- Expand the digest and detail views while keeping the current design system consistent.

## Avoid
- Reverting to starter-template UI
- Shipping placeholder lorem ipsum or fake market records
- Mixing database access logic into presentational components
- Large visual regressions that flatten the current design language
