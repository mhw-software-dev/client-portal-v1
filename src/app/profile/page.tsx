import { redirect } from "next/navigation";

import { Footer, PortalNav } from "@/components/portal-shell";
import { getClientProfile } from "@/lib/airtable";
import { getAccountManagerContact } from "@/lib/account-managers";
import { getClientPortalSession } from "@/lib/auth";

type ProfileIconName = "email" | "hotel" | "manager" | "phone";

function ProfileIcon({ name }: { name: ProfileIconName }) {
  const paths: Record<ProfileIconName, string[]> = {
    email: [
      "M4 6.5h16v11H4z",
      "m4.5 7 7.5 6 7.5-6",
    ],
    hotel: [
      "M5 19V6.5L12 4l7 2.5V19",
      "M9 19v-5h6v5",
      "M9 9h.01M12 9h.01M15 9h.01M9 12h.01M12 12h.01M15 12h.01",
    ],
    manager: [
      "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
      "M5 20a7 7 0 0 1 14 0",
    ],
    phone: [
      "M7 5h3l1.2 3-2 1.3a11 11 0 0 0 5.5 5.5l1.3-2L19 14v3a2 2 0 0 1-2.2 2 14 14 0 0 1-11.8-11.8A2 2 0 0 1 7 5Z",
    ],
  };

  return (
    <span className="mhw-profile-detail-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {paths[name].map((path) => (
          <path d={path} key={path} />
        ))}
      </svg>
    </span>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ProfileIconName;
  label: string;
  value?: string;
}) {
  if (!value?.trim()) return null;

  return (
    <div className="mhw-profile-detail">
      <ProfileIcon name={icon} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function RequiredDetailItem({
  icon,
  label,
  value,
}: {
  icon: ProfileIconName;
  label: string;
  value: string;
}) {
  return (
    <div className="mhw-profile-detail">
      <ProfileIcon name={icon} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ContactLinks({
  email,
  phone,
  tel,
}: {
  email: string;
  phone: string;
  tel: string;
}) {
  return (
    <div className="mhw-profile-detail mhw-profile-detail-contact">
      <ProfileIcon name="phone" />
      <div>
        <span>Account manager contact</span>
        <strong className="mhw-profile-contact-links">
          <a href={`mailto:${email}`}>{email}</a>
          <a href={`tel:${tel}`}>{phone}</a>
        </strong>
      </div>
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
            <header className="mhw-profile-page-header">
              <p className="mhw-kicker">Account Settings</p>
              <h1>My Profile</h1>
              <p>Review the contact details connected to your MHW Client Portal access.</p>
            </header>

            <section className="mhw-profile-card" aria-label="Client profile details">
              {profile.status === "connected" ? (
                <>
                  <div className="mhw-profile-card-header">
                    <div className="mhw-profile-avatar" aria-hidden="true">
                      {(profile.name || profile.email || "C").charAt(0).toUpperCase()}
                    </div>
                    <div className="mhw-profile-heading">
                      <p className="mhw-kicker">Client Contact</p>
                      <h2>{profile.name || "Client Contact"}</h2>
                      {profile.jobTitle ? (
                        <span className="mhw-profile-job-title">{profile.jobTitle}</span>
                      ) : null}
                      <span>{profileEmail}</span>
                    </div>
                  </div>

                  <div className="mhw-profile-details">
                    <DetailItem icon="email" label="Email address" value={profileEmail} />
                    <DetailItem icon="hotel" label="Property" value={profile.hotelName} />
                    <RequiredDetailItem
                      icon="manager"
                      label="Account manager"
                      value={profile.accountManager || "No MHW Account Manager assigned"}
                    />
                    {accountManagerContact ? <ContactLinks {...accountManagerContact} /> : null}
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
