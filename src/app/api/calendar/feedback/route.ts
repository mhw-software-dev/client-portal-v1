import { NextResponse } from "next/server";

import { getClientPortalSession } from "@/lib/auth";
import { submitClientBookingFeedback } from "@/lib/airtable";

type FeedbackRequestBody = {
  bookingId?: unknown;
  notes?: unknown;
  rating?: unknown;
};

export async function POST(request: Request) {
  const session = await getClientPortalSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: FeedbackRequestBody;

  try {
    body = (await request.json()) as FeedbackRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const bookingId = sanitizeText(body.bookingId, 120);
  const notes = sanitizeText(body.notes, 2500);
  const rating = typeof body.rating === "number" ? body.rating : Number(body.rating);

  if (!bookingId) {
    return NextResponse.json({ error: "Choose a booking before submitting feedback." }, { status: 400 });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choose a performer rating." }, { status: 400 });
  }

  if (notes.length < 5) {
    return NextResponse.json(
      { error: "Add a brief feedback note before submitting." },
      { status: 400 },
    );
  }

  try {
    await submitClientBookingFeedback({
      email: session.email,
      input: {
        bookingId,
        notes,
        rating,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error("Client booking feedback failed", {
      bookingId,
      email: session.email,
      message: errorMessage,
    });

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "We could not submit feedback right now. Please try again."
            : errorMessage,
      },
      { status: 500 },
    );
  }
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, maxLength);
}
