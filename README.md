# Predict402

Prediction markets with x402-paid research and MCP execution.

**Status:** Market MVP foundation

Combine market creation, betting, and paid research so agents can discover, analyze, and act on prediction opportunities.

## Current MVP
- Base industrial-neon UI theme from the shared suite prompt.
- Responsive dashboard with wallet/action controls, live market metrics, workflow, MCP tools, and record surface.
- File-backed market registry with creation, x402 quote lookup, paid research report execution, and receipt recording.
- Demo x402 flow that returns `402 Payment Required` until a payment header or demo payment approval is provided.
- Product status API at `/api/predict402/status`.
- MCP-compatible JSON endpoint at `/api/mcp/predict402`.
- Smoke checks for creation, listing, quote, unpaid lock, paid unlock, receipt, and MCP quote.

## API Surface
- `GET /api/predict402/markets` lists active markets.
- `POST /api/predict402/markets` creates a market.
- `GET /api/predict402/markets/:slug/quote` returns the x402 payment requirement.
- `POST /api/predict402/markets/:slug/run` executes the paid research report after payment verification and records a receipt.
- `GET /api/predict402/status` returns dashboard data and stats.
- `GET /api/mcp/predict402` lists MCP tools.
- `POST /api/mcp/predict402` runs MVP tools for discovery, quote preparation, and stats.

## Local Development
```bash
npm install
npm run dev -- -p 3006
```

Open `http://127.0.0.1:3006`.

Local data is written to `.data/predict402-db.json`. Override it with `PREDICT402_DATA_FILE` for isolated runs.

## Environment
Copy `.env.example` to `.env.local` when you need custom payment behavior.

- `PREDICT402_PAYMENT_MODE=demo` accepts the `x-demo-payment: accepted` header for local demos.
- `PREDICT402_PAYMENT_MODE=strict` requires a real `x-payment` header and facilitator configuration.
- `X402_FACILITATOR_URL` points to a facilitator that can verify and settle x402 payments.
- `X402_RECEIVING_ADDRESS` sets the payout address for paid runs.

## Checks
```bash
npm run typecheck
npm run build
npm run test:smoke
```

## Next Build Slice
Add market creation terms, research authoring, and user-approved Base bet preparation.

## License
MIT
