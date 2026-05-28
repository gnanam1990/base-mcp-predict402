import { NextResponse } from "next/server";
import { paymentRequirement } from "@/lib/mvp-payment";
import { findItem } from "@/lib/mvp-store";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const item = findItem(slug);
  if (!item) {
    return NextResponse.json({ error: "market_not_found" }, { status: 404 });
  }

  const resource = new URL(`/api/predict402/markets/${item.slug}/run`, request.url).toString();
  return NextResponse.json({
    data: {
      item,
      payment: paymentRequirement(item, resource),
    },
  });
}
