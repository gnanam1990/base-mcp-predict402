# Predict402 Architecture

## Product Role
Predict402 combines binary prediction markets with x402-gated research feeds and MCP tools for market creation, analysis, and betting.

## System Shape
- Frontend app: Next.js, TypeScript, Tailwind, shadcn-style components, responsive dashboards.
- API layer: Node/TypeScript endpoints for product reads, prepare flows, analytics, and x402-gated access.
- Base layer: Base Account for user approval and Base MCP for assistant-driven actions.
- Payment layer: x402 for paid API/content/service access using USDC on Base or Base Sepolia.
- Data layer: PostgreSQL for durable product state and Redis for cache/session/rate-limit workloads.
- Contracts: Solidity/Foundry only where the module needs onchain state or settlement logic.

## Main Modules
- Binary market factory with market creation, betting, and resolution flows.
- Market explorer with odds, volume, end time, and settlement state.
- x402-gated research reports attached to markets.
- MCP tools for finding markets, creating markets, buying positions, and reading paid research.
- Leaderboard and activity feed for agents and human users.

## Data Model
- Market metadata, outcomes, liquidity, positions, and resolution records.
- Research reports, prices, purchases, and receipts.
- User and agent activity, leaderboards, and PnL snapshots.
- Risk warnings and market status flags.

## MCP And x402 Pattern
Every write action should be exposed as a prepare endpoint that returns unsigned calldata or a payment request. MCP/plugin documentation must explain onboarding, read endpoints, prepare endpoints, and the mapping into Base MCP actions.

For paid resources, endpoints should return an x402 payment requirement before serving premium data. The app must enforce a user-defined max payment cap and record receipts for analytics and support.

## Safety Defaults
- Base Sepolia first, then Base mainnet.
- No private keys in app config.
- No hidden approvals or auto-execution.
- Clear user review before paid access or onchain writes.
- Placeholder env vars only in committed files.
