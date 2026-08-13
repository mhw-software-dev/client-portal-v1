import { NextResponse } from "next/server";

import { clearClientPortalSession } from "@/lib/auth";

export async function POST(request: Request) {
  await clearClientPortalSession();

  return NextResponse.redirect(new URL("/sign-in", request.url), {
    status: 303,
  });
}
