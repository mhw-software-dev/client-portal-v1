import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthContinueForm } from "@/components/auth-continue-form";
import { checkClientPortalAccess } from "@/lib/airtable";
import {
  findClientPortalSignInToken,
  markClientPortalSignInTokenUsed,
  type StoredClientPortalToken,
} from "@/lib/auth-tokens";
import { setClientPortalSession } from "@/lib/auth";

type CallbackPageProps = {
  searchParams: Promise<{ token?: string }>;
};

type TokenValidationResult =
  | { error: string; status: "error" }
  | { status: "ready"; token: StoredClientPortalToken };

async function validateToken(token: string): Promise<TokenValidationResult> {
  if (!token) {
    return { error: "invalid", status: "error" };
  }

  try {
    const storedToken = await findClientPortalSignInToken(token);

    if (!storedToken) {
      return { error: "invalid", status: "error" };
    }

    if (storedToken.usedAt || storedToken.status.toLowerCase() === "used") {
      return { error: "used", status: "error" };
    }

    const expiresAt = new Date(storedToken.expiresAt);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      return { error: "expired", status: "error" };
    }

    return { status: "ready", token: storedToken };
  } catch (error) {
    console.error("Client portal callback validation failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return { error: "callback", status: "error" };
  }
}

async function completeClientPortalSignIn(formData: FormData) {
  "use server";

  const token = String(formData.get("token") ?? "").trim();
  const validation = await validateToken(token);

  if (validation.status === "error") {
    redirect(`/sign-in?error=${validation.error}`);
  }

  const accessCheck = await checkClientPortalAccess(validation.token.email);

  if (accessCheck.status !== "authorized" || !accessCheck.contact) {
    redirect("/sign-in?error=unauthorized");
  }

  try {
    await markClientPortalSignInTokenUsed(validation.token.id);
    await setClientPortalSession(accessCheck.contact, {
      tokenRecordId: validation.token.id,
    });
  } catch (error) {
    console.error("Client portal sign-in completion failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });

    redirect("/sign-in?error=callback");
  }

  redirect("/");
}

export default async function AuthCallbackPage({ searchParams }: CallbackPageProps) {
  const { token = "" } = await searchParams;
  const validation = await validateToken(token.trim());

  if (validation.status === "error") {
    redirect(`/sign-in?error=${validation.error}`);
  }

  return (
    <main className="mhw-auth-page">
      <section className="mhw-auth-card is-continue-card" aria-labelledby="continue-title">
        <div className="mhw-auth-panel is-form-panel">
          <Image
            alt="MHW Live Music"
            height={62}
            priority
            src="/mhw-logo.png"
            width={250}
          />
          <div className="mhw-auth-copy">
            <p className="mhw-kicker">Secure sign in</p>
            <div className="mhw-auth-title-row">
              <h1 id="continue-title">Continue to your client portal.</h1>
              <span className="mhw-auth-info" tabIndex={0}>
                <span aria-hidden="true">i</span>
                <span className="mhw-auth-info-tooltip" role="tooltip">
                  This link expires after 30 minutes and can only be completed once.
                  Your portal session stays active for 12 hours. If you log out,
                  request a new sign-in link to return.
                </span>
              </span>
            </div>
            <p>
              Your secure link has been verified. Continue below to open your MHW
              Client Portal session.
            </p>
          </div>
          <AuthContinueForm
            action={completeClientPortalSignIn}
            token={validation.token.token}
          />
          <div className="mhw-auth-help">
            <p>This link can only be completed once.</p>
            <Link href="/sign-in">Request a new link</Link>
          </div>
        </div>

        <aside className="mhw-auth-panel is-info-panel" aria-label="Portal security">
          <p className="mhw-kicker">Protected access</p>
          <h2>One more click keeps your link safe.</h2>
          <ul>
            <li>Email previews can open links automatically.</li>
            <li>Your session starts only after you click continue.</li>
            <li>Expired or previously used links must be requested again.</li>
          </ul>
          <p>Access is managed by MHW for approved client contacts.</p>
        </aside>
      </section>
    </main>
  );
}
