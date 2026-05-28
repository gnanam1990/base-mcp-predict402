import { NextResponse } from "next/server";
import projectData from "@/lib/project-data.json";

export function GET() {
  return NextResponse.json({
    data: projectData,
    status: "mvp_foundation_ready",
  });
}
