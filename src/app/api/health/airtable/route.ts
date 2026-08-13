import { NextResponse } from "next/server";
import { checkAirtableHealth } from "@/lib/airtable";

export async function GET() {
  const health = await checkAirtableHealth();
  const status = health.status === "connected" ? 200 : 503;

  return NextResponse.json(health, { status });
}
