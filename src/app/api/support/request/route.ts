import { NextResponse } from "next/server";

import { getClientPortalSession } from "@/lib/auth";
import { createClientPortalSupportRequest } from "@/lib/support-requests";

const ALLOWED_REQUEST_TYPES = new Set([
  "Schedule question",
  "Portal issue",
  "Update request",
  "Other",
]);

type SupportRequestBody = {
  message?: unknown;
  pageUrl?: unknown;
  requestType?: unknown;
  subject?: unknown;
};

export async function POST(request: Request) {
  const session = await getClientPortalSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SupportRequestBody;

  try {
    body = (await request.json()) as SupportRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const requestType = sanitizeText(body.requestType, 80);
  const subject = sanitizeText(body.subject, 160);
  const message = sanitizeText(body.message, 2000);
  const pageUrl = sanitizeText(body.pageUrl, 500);

  if (!ALLOWED_REQUEST_TYPES.has(requestType)) {
    return NextResponse.json({ error: "Choose a valid request type." }, { status: 400 });
  }

  if (subject.length < 3) {
    return NextResponse.json({ error: "Add a short subject." }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json(
      { error: "Add a little more detail before submitting." },
      { status: 400 },
    );
  }

  try {
    await createClientPortalSupportRequest({
      input: {
        message,
        pageUrl,
        requestType,
        subject,
      },
      session,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Client portal support request failed", {
      email: session.email,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "We could not send your request right now. Please try again." },
      { status: 500 },
    );
  }
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, maxLength);
}
