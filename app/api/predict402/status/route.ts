import { NextResponse } from "next/server";
import { dashboardData, projectStats } from "@/lib/mvp-store";

export function GET() {
  return NextResponse.json({
    data: dashboardData(),
    stats: projectStats(),
    status: "mvp_foundation_ready",
  });
}
