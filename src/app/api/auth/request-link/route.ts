import { NextResponse } from "next/server";

import { checkClientPortalAccess } from "@/lib/airtable";
import { createClientPortalSignInToken } from "@/lib/auth-tokens";
import { sendClientPortalSignInEmail } from "@/lib/email";

const neutralMessage =
  "If this email has access, a secure sign-in link will be sent shortly. Please check your inbox and spam folder.";

export async function POST(request: Request) {
  let email = "";

  try {
    const body = (await request.json()) as { email?: string };
    email = body.email?.trim() ?? "";
  } catch {
    return NextResponse.json({ message: neutralMessage });
  }

  if (!email) {
    return NextResponse.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const accessCheck = await checkClientPortalAccess(email);

    if (accessCheck.status === "authorized" && accessCheck.contact) {
      const token = await createClientPortalSignInToken({
        contact: accessCheck.contact,
        request,
      });

      await sendClientPortalSignInEmail({
        expiresAt: token.expiresAt,
        hotelName: accessCheck.contact.hotelName,
        signInUrl: token.signInUrl,
        to: accessCheck.contact.email,
      });

      console.info("Client portal sign-in email sent", {
        contactRecordId: accessCheck.contact.contactRecordId,
        email,
        expiresAt: token.expiresAt,
        hotelRecordId: accessCheck.contact.hotelRecordId,
        signInUrl:
          process.env.NODE_ENV === "production" ? undefined : token.signInUrl,
        tokenRecordId: token.tokenRecordId,
      });
    } else if (
      accessCheck.status === "missing_config" ||
      accessCheck.status === "error"
    ) {
      console.error("Client portal sign-in check failed", {
        email,
        message: accessCheck.message,
        status: accessCheck.status,
      });
    } else {
      console.info("Client portal sign-in not authorized", { email });
    }

    return NextResponse.json({ message: neutralMessage });
  } catch (error) {
    console.error("Client portal sign-in request failed", {
      email,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        message:
          "We could not request a sign-in link right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
