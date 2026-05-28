import { NextResponse } from "next/server";
import { paymentRequiredBody, verifyMvpPayment } from "@/lib/mvp-payment";
import { findItem, recordPaidRun } from "@/lib/mvp-store";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const item = findItem(slug);
  if (!item) {
    return NextResponse.json({ error: "market_not_found" }, { status: 404 });
  }

  const resource = new URL(`/api/predict402/markets/${item.slug}/run`, request.url).toString();
  const verification = await verifyMvpPayment(request, item, resource);
  if (!verification.ok) {
    const body = paymentRequiredBody(item, resource);
    return NextResponse.json({ ...body, reason: verification.reason }, { status: 402 });
  }

  const receipt = recordPaidRun(item.slug, {
    network: verification.network,
    paymentMode: verification.mode,
    paymentPayloadHash: verification.paymentPayloadHash,
    facilitatorReference: verification.facilitatorReference,
  });

  const response = NextResponse.json({
    data: {
      item: {
        slug: item.slug,
        name: item.name,
        descriptor: item.descriptor,
        detail: item.detail,
      },
      result: item.payload,
    },
    receipt,
  });

  if (verification.paymentResponse) {
    response.headers.set("payment-response", verification.paymentResponse);
  }

  return response;
}
