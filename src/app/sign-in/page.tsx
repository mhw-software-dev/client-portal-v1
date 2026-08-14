import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInErrorNotice } from "@/components/sign-in-error-notice";
import { SignInForm } from "@/components/sign-in-form";
import { getClientPortalSession } from "@/lib/auth";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; reason?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [{ error, reason }, session] = await Promise.all([
    searchParams,
    getClientPortalSession(),
  ]);

  if (session) {
    redirect("/");
  }

  return (
    <main className="mhw-auth-page">
      <section className="mhw-auth-card" aria-labelledby="sign-in-title">
        <div className="mhw-auth-panel is-form-panel">
          <Image
            alt="MHW Live Music"
            height={62}
            priority
            src="/mhw-logo.png"
            width={250}
          />
          <div className="mhw-auth-copy">
            <p className="mhw-kicker">Client Portal</p>
            <h1 id="sign-in-title">Sign in to your MHW portal.</h1>
            <p>
              Enter the email MHW has on file. Approved client contacts will receive
              a secure sign-in link.
            </p>
          </div>
          <SignInErrorNotice error={error} reason={reason} />
          <SignInForm />
          <div className="mhw-auth-help">
            <p>Need access?</p>
            <Link href="https://www.mhwlivemusic.com/contact" target="_blank">
              Contact MHW
            </Link>
          </div>
        </div>

        <aside className="mhw-auth-panel is-info-panel" aria-label="Portal details">
          <p className="mhw-kicker">Built for MHW clients</p>
          <h2>Schedules, performer details, and planning status in one place.</h2>
          <ul>
            <li>Review upcoming entertainment bookings.</li>
            <li>Open detailed performer and schedule information.</li>
            <li>Track holiday coverage and schedule validation.</li>
          </ul>
          <p>
            Access is managed by MHW. No public signup is needed for this portal.
          </p>
        </aside>
      </section>
    </main>
  );
}
