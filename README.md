# Predict402

> Payment-gated prediction-market research: an HTTP-402 server that locks analysis reports behind x402 micropayments and exposes the same flows as MCP-style tools.

![License](https://img.shields.io/badge/license-MIT-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6) ![Next.js](https://img.shields.io/badge/Next.js-16-black)

## Overview

Predict402 is a Next.js application that models a prediction-market workflow where research reports are sold via the x402 payment standard. Clients request a market's research run, receive an HTTP `402 Payment Required` response describing the price and payment requirement, and re-request with a payment header to unlock the report and receive a receipt. The same discovery, quote, and stats operations are also exposed through an MCP-compatible JSON endpoint so automated agents can drive the flow. It is intended as an MVP foundation for builders exploring x402-gated content and agent-driven prediction research.

## Features

- File-backed market registry: create markets, list active markets, and seed demo data on first run.
- x402 payment gate: research runs return `402 Payment Required` with an `accepts` payment requirement until payment is provided.
- Two payment modes: a `demo` mode that accepts an `x-demo-payment` header for local testing, and a `strict` mode that verifies and settles a real `x-payment` header against an external facilitator.
- Receipts: each paid run records a receipt (amount, asset, network, payment mode, payload hash, facilitator reference) and updates per-market stats.
- MCP-compatible endpoint: lists tools and runs discovery, quote-preparation, and stats tools over JSON.
- Status/dashboard API and a responsive dashboard UI.
- Smoke test covering create, list, quote, unpaid lock, paid unlock, receipt, and MCP quote.

## Tech stack

- Next.js 16 (App Router) with React 19
- TypeScript
- lucide-react (icons)
- Node.js built-ins (`fs`, `crypto`) for the file-backed store and payload hashing
- x402 payment protocol (`x402Version: 1`, `exact` scheme, USDC)

## Getting started

### Prerequisites

- Node.js 18+ (Next.js 16 / React 19)
- npm

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env.local` when you need custom payment behavior. The variables the app reads:

| Variable | Purpose |
| --- | --- |
| `PREDICT402_PAYMENT_MODE` | `demo` (default) accepts the `x-demo-payment` header; `strict` requires a real `x-payment` header and a configured facilitator. |
| `PREDICT402_X402_NETWORK` | x402 network identifier for payment requirements (default `eip155:8453`). |
| `X402_FACILITATOR_URL` | Facilitator base URL used to `verify` and `settle` payments in strict mode. |
| `X402_RECEIVING_ADDRESS` | Payout address embedded in the payment requirement. |
| `PREDICT402_DATA_FILE` | Overrides the JSON data file path for isolated runs. |

The `.env.example` file also includes Base chain, Base Account/MCP, and app placeholders (`NEXT_PUBLIC_BASE_CHAIN_ID`, `BASE_RPC_URL`, `BASE_ACCOUNT_CLIENT_ID`, `BASE_MCP_URL`, `X402_DEFAULT_NETWORK`, `DATABASE_URL`, `REDIS_URL`, `NEXT_PUBLIC_APP_URL`) for future use; they are not all consumed by the current code.

Never commit real secret values.

### Running

```bash
npm run dev -- -p 3006
```

Open `http://127.0.0.1:3006`.

Local data is written to `.data/predict402-db.json` (or `/tmp` on Vercel). Override the path with `PREDICT402_DATA_FILE` for isolated runs.

## Usage

### HTTP API

- `GET /api/predict402/markets` — list active markets.
- `POST /api/predict402/markets` — create a market (`name`, `descriptor`, `detail`, `priceUsdc`, `payload`).
- `GET /api/predict402/markets/:slug/quote` — return the market item and its x402 payment requirement.
- `POST /api/predict402/markets/:slug/run` — execute the paid research run; returns `402` with a payment requirement until payment is verified, otherwise returns the report plus a receipt and a `payment-response` header.
- `GET /api/predict402/status` — return dashboard data and aggregate stats.

### MCP endpoint

- `GET /api/mcp/predict402` — list the server name, version, and available tools.
- `POST /api/mcp/predict402` — run a tool by `tool` name with `arguments`. Supported tools include discovery (e.g. `find_markets`, `list_markets`), `get_market_quote`, `prepare_market_run`, and `get_predict402_stats`.

### Example: unlock a report in demo mode

```bash
# Returns 402 with a payment requirement
curl -X POST http://127.0.0.1:3006/api/predict402/markets/<slug>/run

# Unlocks the report in demo mode
curl -X POST http://127.0.0.1:3006/api/predict402/markets/<slug>/run \
  -H "x-demo-payment: accepted"
```

## Testing

The smoke test exercises the full flow against a running server (defaults to `http://127.0.0.1:3006`, override with `PREDICT402_BASE_URL`):

```bash
npm run typecheck   # next typegen && tsc --noEmit
npm run build       # next build
npm run test:smoke  # start the dev server first, then run this
```

## Project structure

```
app/
  api/
    mcp/predict402/        MCP-compatible tool endpoint
    predict402/
      markets/             list/create, [slug]/quote, [slug]/run
      status/              dashboard data + stats
  page.tsx, layout.tsx     dashboard UI
lib/
  mvp-payment.ts           x402 requirement, demo/facilitator verification
  mvp-store.ts             file-backed market registry, receipts, stats
  project-data.json        seed data, metrics, tool names
  types.ts
scripts/
  smoke-test.mjs           end-to-end smoke test
docs/                      architecture, demo script, roadmap, UI notes
```

## Status

MVP foundation. The market registry, x402 payment gate, receipts, and MCP endpoint are implemented and covered by a smoke test. Persistence is a local JSON file (not a database), and `demo` payment mode is the default — it accepts a header without on-chain settlement. Strict mode performs real `verify`/`settle` calls but requires an external facilitator (`X402_FACILITATOR_URL`); no facilitator is bundled. Research "reports" are the stored market payloads rather than generated analysis. Several `.env.example` placeholders (database, Redis, Base Account/MCP) are reserved for planned work and not yet wired in.

## License

MIT — see [LICENSE](LICENSE).
