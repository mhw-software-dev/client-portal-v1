"use client";

import { useEffect } from "react";

export type BookingDetailEvent = {
  accountManager?: string;
  additionalPerformanceLinks?: string;
  date: string;
  displayDate?: string;
  genres?: string;
  headshot?: string;
  hotel?: string;
  hotelTimezone?: string;
  instrumentation?: string;
  modPhone?: string;
  performer?: string;
  performerBio?: string;
  promoVideo?: string;
  socialMediaOrWebsite?: string;
  time: string;
  title: string;
  venue: string;
};

const dateLabelFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  weekday: "long",
  year: "numeric",
});

function getEventDate(event: BookingDetailEvent) {
  const rawDate = event.date.trim();

  if (!rawDate) return new Date(Number.NaN);

  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(rawDate);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const usDateMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(rawDate);
  if (usDateMatch) {
    const [, month, day, year] = usDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(rawDate);
}

function getEventDateLabel(event: BookingDetailEvent) {
  return event.displayDate?.trim() || dateLabelFormatter.format(getEventDate(event));
}

function hasContent(value?: string) {
  return Boolean(value?.trim());
}

function getTimezoneLabel(hotelTimezone?: string) {
  const trimmedTimezone = hotelTimezone?.trim();
  return trimmedTimezone ? `Times shown in ${trimmedTimezone}` : "Times shown in property local time";
}

function getHref(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  const embeddedUrl = trimmedValue.match(/https?:\/\/[^\s|,]+|www\.[^\s|,]+/i)?.[0] || "";
  if (embeddedUrl) {
    return /^www\./i.test(embeddedUrl) ? `https://${embeddedUrl}` : embeddedUrl;
  }

  if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue;
  if (/^www\./i.test(trimmedValue)) return `https://${trimmedValue}`;

  return "";
}

function getAccountManagerContact(accountManager?: string) {
  const normalizedName = accountManager?.trim().toLowerCase();

  if (normalizedName === "tina brulport") {
    return {
      email: "tbrulport@mhwlivemusic.com",
      phone: "(305) 414-1309",
    };
  }

  return null;
}

export function BookingDetailModal({
  event,
  onClose,
}: {
  event: BookingDetailEvent | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!event) return;

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [event, onClose]);

  if (!event) return null;

  const scheduleSummary = [
    ["Gig Date", getEventDateLabel(event)],
    ["Gig Time Span", event.time],
    ["Timezone", event.hotelTimezone || "Property local time"],
    ["Venue", event.venue],
  ].filter(([, value]) => hasContent(value));

  const planningItems = [
    ["Client / property", event.hotel],
    ["Account Manager", event.accountManager],
  ].filter(([, value]) => hasContent(value));

  const accountManagerContact = getAccountManagerContact(event.accountManager);

  const performerItems = [
    ["Performer", event.performer],
    ["Social Media or Website", event.socialMediaOrWebsite],
    ["Genres", event.genres],
    ["Instrumentation", event.instrumentation],
  ].filter(([, value]) => hasContent(value));
  const socialHref = getHref(event.socialMediaOrWebsite || "");
  const additionalLinksHref = getHref(event.additionalPerformanceLinks || "");
  const socialDisplayValue = socialHref || event.socialMediaOrWebsite || "";
  return (
    <div className="mhw-modal-backdrop" onMouseDown={onClose} role="presentation">
      <section
        aria-labelledby="booking-detail-title"
        aria-modal="true"
        className="mhw-booking-modal"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
        role="dialog"
      >
        <div className="mhw-modal-header">
          <div className="mhw-modal-header-content">
            {event.headshot ? (
              <a
                aria-label={`Download ${event.performer || "performer"} headshot`}
                className="mhw-modal-header-headshot is-clickable"
                download
                href={event.headshot}
                rel="noreferrer"
                target="_blank"
                title="Download performer headshot"
              >
                <img alt={`${event.performer || "Performer"} headshot`} src={event.headshot} />
                <span>Download</span>
              </a>
            ) : (
              <div
                aria-label="Performer headshot not available"
                className="mhw-modal-header-headshot"
                title="Performer headshot not available"
              >
                <span className="mhw-modal-user-icon" aria-hidden="true" />
              </div>
            )}
            <div>
              <p className="mhw-kicker">Booking Details</p>
              <h2 id="booking-detail-title">{event.title}</h2>
              <div className="mhw-modal-meta-row">
                <span>{getEventDateLabel(event)}</span>
                <span>{event.time}</span>
                <span>{getTimezoneLabel(event.hotelTimezone)}</span>
                <span>{event.venue}</span>
              </div>
            </div>
          </div>
          <button aria-label="Close booking details" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="mhw-modal-body">
          <section className="mhw-modal-section">
            <div className="mhw-modal-section-heading">
              <p className="mhw-kicker">Schedule Details</p>
              <h3>Performance details</h3>
            </div>
            <div className="mhw-modal-summary-strip" aria-label="Key booking details">
              {scheduleSummary.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="mhw-modal-section">
            <div className="mhw-modal-section-heading">
              <p className="mhw-kicker">Performer Details</p>
              <h3>Performer details</h3>
            </div>
            <div className="mhw-modal-note-panel">
              <span>Performer Bio</span>
              <p>{event.performerBio || "Performer bio is not available yet."}</p>
            </div>
            <div className="mhw-modal-detail-grid">
              {performerItems.map(([label, value]) => (
                <div className="mhw-modal-detail-card" key={label}>
                  <span>{label}</span>
                  {label === "Social Media or Website" && socialHref ? (
                    <a href={socialHref} rel="noreferrer" target="_blank">
                      {socialDisplayValue}
                    </a>
                  ) : (
                    <strong>{value}</strong>
                  )}
                </div>
              ))}
            </div>
            {hasContent(event.additionalPerformanceLinks) ? (
              <div className="mhw-modal-media-link">
                <span>Additional Video / Performance Links</span>
                {additionalLinksHref ? (
                  <a href={additionalLinksHref} rel="noreferrer" target="_blank">
                    {event.additionalPerformanceLinks}
                  </a>
                ) : (
                  <strong>{event.additionalPerformanceLinks}</strong>
                )}
              </div>
            ) : null}
            <div className={`mhw-modal-video-panel${hasContent(event.promoVideo) ? "" : " is-empty"}`}>
              <span>Promo Video</span>
              {hasContent(event.promoVideo) ? (
                <video controls preload="metadata" src={event.promoVideo}>
                  Your browser does not support embedded video playback.
                </video>
              ) : (
                <div className="mhw-modal-video-empty">
                  <span aria-hidden="true" className="mhw-modal-video-icon" />
                  <strong>No promo video available yet.</strong>
                  <p>A promo video is not available for this performer at this time.</p>
                </div>
              )}
            </div>
          </section>

          {planningItems.length > 0 ? (
            <section className="mhw-modal-section mhw-modal-section-muted">
              <div className="mhw-modal-section-heading">
                <p className="mhw-kicker">Schedule Support</p>
                <h3>Need help with this booking?</h3>
              </div>
              <div className="mhw-modal-info-panel">
                <p>
                  For schedule questions or day-of updates, use the contact details below.
                </p>
                {planningItems.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
                {accountManagerContact ? (
                  <>
                    <div>
                      <span>Account Manager Email</span>
                      <a href={`mailto:${accountManagerContact.email}`}>
                        {accountManagerContact.email}
                      </a>
                    </div>
                    <div>
                      <span>Account Manager Phone</span>
                      <a href={`tel:${accountManagerContact.phone.replace(/[^\d+]/g, "")}`}>
                        {accountManagerContact.phone}
                      </a>
                    </div>
                  </>
                ) : null}
                {hasContent(event.modPhone) ? (
                  <div>
                    <span>MOD Phone</span>
                    <a href={`tel:${event.modPhone?.replace(/[^\d+]/g, "")}`}>{event.modPhone}</a>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>

        <div className="mhw-modal-footer">
          <button className="mhw-secondary-button" onClick={onClose} type="button">
            Close
          </button>
          <a
            className="mhw-primary-button"
            href="https://www.mhwlivemusic.com/contact"
            rel="noreferrer"
            target="_blank"
          >
            Contact MHW
          </a>
        </div>
      </section>
    </div>
  );
}
