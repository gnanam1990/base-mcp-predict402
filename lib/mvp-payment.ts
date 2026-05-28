import crypto from "node:crypto";
import type { MvpItem } from "./mvp-store";

export function paymentRequirement(item: MvpItem, resourceUrl: string) {
  return {
    scheme: "exact" as const,
    network: process.env.PREDICT402_X402_NETWORK || "eip155:84532",
    asset: "USDC" as const,
    amount: item.priceUsdc.toFixed(3),
    payTo: process.env.X402_RECEIVING_ADDRESS || "0x1111111111111111111111111111111111111111",
    resource: resourceUrl,
    description: `Unlock Predict402 research report for ${item.priceUsdc.toFixed(3)} USDC on Base Sepolia.`,
  };
}

export function paymentRequiredBody(item: MvpItem, resourceUrl: string) {
  const requirement = paymentRequirement(item, resourceUrl);
  return {
    error: "payment_required",
    x402Version: 1,
    description: requirement.description,
    accepts: [requirement],
  };
}

export async function verifyMvpPayment(request: Request, item: MvpItem, resourceUrl: string) {
  const demoPayment = request.headers.get("x-demo-payment");
  const paymentHeader = request.headers.get("x-payment");
  const mode = process.env.PREDICT402_PAYMENT_MODE || "demo";
  const requirement = paymentRequirement(item, resourceUrl);

  if (demoPayment && mode !== "strict") {
    return {
      ok: true as const,
      mode: "demo" as const,
      network: requirement.network,
      paymentPayloadHash: hashPayload(demoPayment),
      paymentResponse: encodePaymentResponse({ mode: "demo", item: item.slug }),
    };
  }

  if (!paymentHeader) {
    return { ok: false as const, reason: "payment_header_missing" };
  }

  const facilitatorUrl = process.env.X402_FACILITATOR_URL;
  if (!facilitatorUrl) {
    return { ok: false as const, reason: "facilitator_not_configured" };
  }

  const paymentPayload = decodePaymentHeader(paymentHeader);
  const payload = { x402Version: 1, paymentPayload, paymentRequirements: requirement };
  const verify = await callFacilitator(`${facilitatorUrl}/verify`, payload);
  if (!verify.ok) {
    return verify;
  }
  const settle = await callFacilitator(`${facilitatorUrl}/settle`, payload);
  if (!settle.ok) {
    return settle;
  }

  return {
    ok: true as const,
    mode: "facilitator" as const,
    network: requirement.network,
    paymentPayloadHash: hashPayload(paymentHeader),
    facilitatorReference: referenceFrom(settle.body),
    paymentResponse: encodePaymentResponse({ verify: verify.body, settle: settle.body }),
  };
}

function hashPayload(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function decodePaymentHeader(paymentHeader: string) {
  try {
    return JSON.parse(paymentHeader) as unknown;
  } catch {
    try {
      return JSON.parse(Buffer.from(paymentHeader, "base64url").toString("utf8")) as unknown;
    } catch {
      return paymentHeader;
    }
  }
}

async function callFacilitator(url: string, body: unknown) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    const json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    const ok = response.ok && json.valid !== false && json.success !== false && !json.error;
    return ok
      ? { ok: true as const, body: json }
      : { ok: false as const, reason: String(json.error || json.reason || response.statusText) };
  } catch (error) {
    return { ok: false as const, reason: error instanceof Error ? error.message : "facilitator_failed" };
  }
}

function referenceFrom(value: unknown) {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  return String(record.txHash || record.transactionHash || record.reference || record.id || "");
}

function encodePaymentResponse(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}
