# SpendFlow Handoff Document

## Current Status
The "SpendFlow" AI-Powered Spend Management Dashboard is functionally complete according to Mission 1 requirements.

**Working Features**:
- **Monorepo Setup**: Turborepo, Next.js 16 (App Router), pnpm workspaces, and Tailwind CSS v4 all integrated.
- **UI Components**: shadcn/ui custom components built out with consistent 8-pt spacing, radius, and OKLCH color palettes (Light/Dark themes).
- **Dashboard**: KPI cards, Cashflow Area Chart, and Spend by Category Donut Chart are populated correctly from the mock API.
- **Bills Page**: Features a robust TanStack Table with row selection, CSV export, search, sorting, and multi-filters (Status, Category). A right-hand sheet shows bill details.
- **Approvals Page**: Approvals queue with optimistic UI updates for approving bills, and a rejection flow with required reason input.
- **Reimbursements Page**: Full form validation using React Hook Form and Zod schemas shared from `@spendflow/shared`.
- **API Simulation**: The frontend `/api/*` endpoints simulate 300–800ms latency and 5% error rates, using an in-memory Singleton store (`store.ts`) mapped to robust Zod seed data.

## Bug Fixes Applied in Step 1
- **API Response Wrappers**: Standardized `useFetch` to not unwrap `json.data ?? json` internally. All endpoints correctly wrap arrays in `{ data: T[] }` to ensure pagination information and arrays are preserved for consumer pages.
- **Filter Default States**: Assured that filters defaulting to `'all'` don't strictly match `"all"` in the client-side data layer.
- **Date Handling**: Migrated SSR date calculations to client-side (`useEffect` / state) to ensure relative dates ("this week") work reliably based on when the user views the page, without causing React hydration mismatches.
- **Shared Package Linting**: Implemented `eslint.config.mjs` flat configuration in `@spendflow/shared` so that `pnpm lint` runs cleanly across the entire monorepo.

## Testing & CI
- **Vitest Unit Tests**: Added unit tests for the `BillsDataTable` filtering logic and the `ReimbursementCreateSchema` form validation. Tests pass successfully.
- **Playwright E2E**: Smoke test created at `apps/web/e2e/smoke.spec.ts` covering the flow of viewing the dashboard, approving a bill, and confirming the status change on the bills table.
- **GitHub Actions**: Configured `.github/workflows/ci.yml` for automated linting, typechecking, and testing on `main`.

## Folder Structure
```text
.
├── apps/
│   └── web/                   # Next.js Application
│       ├── src/app/           # App Router pages and API routes
│       ├── src/components/    # shadcn/ui components and layouts
│       ├── src/lib/           # store.ts (In-memory DB) and utils
│       ├── src/hooks/         # use-fetch.ts
│       └── e2e/               # Playwright tests
├── packages/
│   └── shared/                # Shared logic and types
│       ├── src/schemas/       # Zod validation schemas
│       ├── src/types/         # Inferred TypeScript types
│       └── src/seed/          # Realistic mocked seed data
└── turbo.json                 # Monorepo pipeline configuration
```

## How to Run
1. Install dependencies: `pnpm install`
2. Start the development server: `pnpm dev`
3. Run unit tests: `pnpm test`
4. Typecheck: `pnpm typecheck`
5. Lint: `pnpm lint`
6. Build for production: `pnpm build`

## Known Issues & Next Steps
- **Playwright Install Timeout**: When running `pnpm test:e2e` for the first time, downloading Chromium binaries via the Microsoft CDN can sometimes timeout depending on network speed. Rerunning `pnpm exec playwright install` usually resolves it.
- **AI Integrations**: Currently, the "AI-powered" aspect is represented by static branding/insight cards. A future phase could wire this to an actual LLM service to categorize incoming receipt uploads.
- **Persistence**: Data resets when the Next.js server restarts. Swapping `store.ts` for a Postgres database (via Prisma or Drizzle) is the next logical step.
