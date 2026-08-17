import { redirect } from "next/navigation";

import { Footer, PortalNav } from "@/components/portal-shell";
import { getClientProfile } from "@/lib/airtable";
import { getAccountManagerContact } from "@/lib/account-managers";
import { getClientPortalSession } from "@/lib/auth";

function DetailItem({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null;

  return (
    <div className="mhw-profile-detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RequiredDetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="mhw-profile-detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await getClientPortalSession();

  if (!session) {
    redirect("/sign-in?reason=session-expired");
  }

  const profile = await getClientProfile(session.email);
  const profileEmail = profile.email || session.email;
  const accountManagerContact = getAccountManagerContact(profile.accountManager);

  return (
    <>
      <PortalNav active="Profile" />
      <main>
        <section className="mhw-profile-hero">
          <div className="mhw-shell mhw-profile-grid">
            <div className="mhw-profile-copy">
              <p className="mhw-kicker">Account Settings</p>
              <h1>Your portal access details.</h1>
              <p>
                Review the contact and property details connected to your MHW
                Client Portal access.
              </p>
            </div>

            <section className="mhw-profile-card" aria-label="Client profile details">
              {profile.status === "connected" ? (
                <>
                  <div className="mhw-profile-avatar" aria-hidden="true">
                    {(profile.name || profile.email || "C").charAt(0).toUpperCase()}
                  </div>
                  <div className="mhw-profile-heading">
                    <p className="mhw-kicker">Client Contact</p>
                    <h2>{profile.name || "Client Contact"}</h2>
                    <span>{profileEmail}</span>
                  </div>

                  <div className="mhw-profile-details">
                    <DetailItem label="Email address" value={profileEmail} />
                    <DetailItem label="Property" value={profile.hotelName} />
                    <RequiredDetailItem
                      label="Account manager"
                      value={profile.accountManager || "No MHW Account Manager assigned"}
                    />
                    {accountManagerContact ? (
                      <div className="mhw-profile-detail">
                        <span>Account manager contact</span>
                        <strong className="mhw-profile-contact-links">
                          <a href={`mailto:${accountManagerContact.email}`}>
                            {accountManagerContact.email}
                          </a>
                          <a href={`tel:${accountManagerContact.tel}`}>
                            {accountManagerContact.phone}
                          </a>
                        </strong>
                      </div>
                    ) : null}
                  </div>

                  <div className="mhw-profile-support">
                    <p>Need to update these details? Contact MHW.</p>
                    <a
                      className="mhw-secondary-button"
                      href="https://www.mhwlivemusic.com/contact"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Contact MHW
                    </a>
                  </div>
                </>
              ) : (
                <div className="mhw-profile-empty">
                  <p className="mhw-kicker">Profile unavailable</p>
                  <h2>We could not load your profile details.</h2>
                  <p>
                    Your portal session is active, but the latest contact details
                    are not available right now. Please refresh the page or contact
                    MHW if this continues.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
