import { NextResponse } from "next/server";

import { getClientCalendarEvents } from "@/lib/airtable";
import { getClientPortalSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getClientPortalSession();

  if (!session) {
    return NextResponse.json(
      {
        checkedAt: new Date().toISOString(),
        events: [],
        message: "Please sign in to view this schedule.",
        status: "not_authorized",
      },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const email = session.email;
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  const result = await getClientCalendarEvents(email, { endDate, startDate });
  const status = result.status === "error" ? 500 : result.status === "missing_config" ? 500 : 200;

  return NextResponse.json(result, { status });
}
