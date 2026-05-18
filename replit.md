# WizKids Carnival Analytics

Analytics dashboard for the WizKids Carnival Talent Pass funnel — tracks daily Meta ad spend, telemetry events, quiz sessions, and provides AI-powered insights.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`, `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — set via Replit AI Integrations

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite at `/` (`artifacts/wkc-analytics`)
- API: Express 5 (`artifacts/api-server`)
- AI: Anthropic claude-sonnet-4-6 via Replit AI Integrations proxy
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/wkc-analytics/src/App.tsx` — entire frontend (single-file React app, ~550 lines)
- `artifacts/api-server/src/routes/ai.ts` — POST /api/ai/complete endpoint (proxies Claude)
- `lib/integrations-anthropic-ai/` — Anthropic SDK client wrapper

## Architecture decisions

- All Claude calls are routed through `/api/ai/complete` on the backend (never expose keys to browser)
- Seeded Meta data and percentage data are hardcoded constants; telemetry comes from CSV upload
- Schema fingerprinting + localStorage caching avoids re-running AI mapping for the same CSV structure
- Internal/test phone numbers are stored in localStorage and filtered from all AI context
- No database — this is a pure analytics tool; data lives in browser state + uploaded CSV

## Product

Four-tab analytics dashboard:
1. **Data Table** — daily Meta spend, derived metrics (CPC/CPL/CTR), telemetry events, editable cells, AI-generated per-day comments, deployment markers
2. **Quiz Sessions** — per-session table parsed from telemetry CSV with filters, sorting, and time-spent breakdowns
3. **Recommendations** — AI-generated action/watch/anomaly items from the full funnel context
4. **Ask AI** — freeform chat about funnel performance

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `%` mode in the Data Table uses `SEED_PCT` hardcoded data — it does not auto-compute from telemetry CSV
- `fetchAIMapping` uses Claude to map arbitrary CSV schemas; result is cached by schema fingerprint
- Replit AI Integrations uses a dummy API key value — the `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` is what matters
