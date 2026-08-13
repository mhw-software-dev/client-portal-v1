"use client";

import { useEffect } from "react";

export type BookingDetailEvent = {
  accountManager?: string;
  additionalPerformanceLinks?: string;
  date: string;
  displayDate?: string;
  genres?: string;
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
  if (/^https?:\/\//i.test(trimmedValue)) return trimmedValue;
  if (/^www\./i.test(trimmedValue)) return `https://${trimmedValue}`;

  return "";
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
    ["Gig Time Span", event.time],
    ["Venue", event.venue],
  ].filter(([, value]) => hasContent(value));

  const planningItems = [
    ["Client / property", event.hotel],
    ["Account Manager", event.accountManager],
    ["MOD Phone", event.modPhone],
  ].filter(([, value]) => hasContent(value));

  const performerItems = [
    ["Performer", event.performer],
    ["Genres", event.genres],
    ["Instrumentation", event.instrumentation],
    ["Social Media or Website", event.socialMediaOrWebsite],
  ].filter(([, value]) => hasContent(value));
  const socialHref = getHref(event.socialMediaOrWebsite || "");
  const additionalLinksHref = getHref(event.additionalPerformanceLinks || "");

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
          <button aria-label="Close booking details" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="mhw-modal-body">
          <section className="mhw-modal-section">
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
              <h3>Entertainment profile</h3>
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
                      {value}
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
            {hasContent(event.promoVideo) ? (
              <div className="mhw-modal-video-panel">
                <span>Promo Video</span>
                <video controls preload="metadata" src={event.promoVideo}>
                  Your browser does not support embedded video playback.
                </video>
              </div>
            ) : null}
          </section>

          {planningItems.length > 0 ? (
            <section className="mhw-modal-section mhw-modal-section-muted">
              <div className="mhw-modal-section-heading">
                <p className="mhw-kicker">Planning Context</p>
                <h3>Operational details</h3>
              </div>
              <div className="mhw-modal-info-panel">
                <p>
                  For schedule questions or day-of updates, please use the MHW
                  contact details below.
                </p>
                {planningItems.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
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
