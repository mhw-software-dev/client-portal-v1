"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BookingDetailModal,
  type BookingDetailEvent,
} from "@/components/booking-detail-modal";
import type { ClientHolidayCoverageItem } from "@/lib/airtable";

type HolidayFilter = "all" | "covered" | "open";

type HomeHolidayCoverageProps = {
  coveredCount: number;
  holidays: ClientHolidayCoverageItem[];
  openCount: number;
  totalCount: number;
  year: number;
};

function DetailsIcon() {
  return (
    <span aria-hidden="true" className="mhw-kpi-detail-icon">
      <svg viewBox="0 0 20 20" focusable="false">
        <path d="M6.25 5.5h8.25v8.25" />
        <path d="M5.5 14.5 14 6" />
      </svg>
    </span>
  );
}

const filterLabels: Record<HolidayFilter, string> = {
  all: "Key holidays",
  covered: "Covered holidays",
  open: "Open holidays",
};

function HolidayMetricButton({
  description,
  filter,
  label,
  onClick,
  value,
}: {
  description: string;
  filter: HolidayFilter;
  label: string;
  onClick: (filter: HolidayFilter) => void;
  value: number;
}) {
  return (
    <button
      className="mhw-stat-card mhw-holiday-kpi-button"
      onClick={() => onClick(filter)}
      type="button"
    >
      <p className="mhw-label">{label}</p>
      <strong>{value}</strong>
      <span>{description}</span>
      <DetailsIcon />
    </button>
  );
}

function HolidayRows({
  expandedHolidayId,
  holidays,
  onSelectBooking,
  onToggleHoliday,
}: {
  expandedHolidayId: string | null;
  holidays: ClientHolidayCoverageItem[];
  onSelectBooking: (booking: BookingDetailEvent) => void;
  onToggleHoliday: (holidayId: string) => void;
}) {
  if (holidays.length === 0) {
    return (
      <div className="mhw-booking-empty">
        <p className="mhw-kicker">Holiday Coverage</p>
        <h3>No holidays match this view.</h3>
        <p>Try another holiday status summary.</p>
      </div>
    );
  }

  return holidays.map((holiday) => {
    const isExpanded = expandedHolidayId === holiday.id;

    return (
      <article className={isExpanded ? "mhw-holiday-row is-expanded" : "mhw-holiday-row"} key={holiday.id}>
        <button
          aria-expanded={isExpanded}
          className="mhw-holiday-row-toggle"
          onClick={() => onToggleHoliday(holiday.id)}
          type="button"
        >
          <div>
            <p className="mhw-holiday-date">{holiday.displayDate}</p>
            <h3>{holiday.holidayName}</h3>
          </div>
          <span
            className={
              holiday.status === "Covered"
                ? "mhw-holiday-status is-covered"
                : "mhw-holiday-status is-open"
            }
          >
            {holiday.status}
          </span>
          <div className="mhw-holiday-schedule">
            {holiday.scheduledGigCount > 0 ? (
              <>
                <strong>
                  {holiday.scheduledGigCount === 1
                    ? "1 scheduled booking"
                    : `${holiday.scheduledGigCount} scheduled bookings`}
                </strong>
                <span>{isExpanded ? "Hide booked gigs" : "View booked gigs"}</span>
              </>
            ) : (
              <>
                <strong>No booking scheduled yet</strong>
                <span>No entertainment booking is currently listed for this holiday.</span>
              </>
            )}
          </div>
        </button>

        {isExpanded ? (
          holiday.scheduledGigEvents.length > 0 ? (
            <div className="mhw-holiday-bookings" aria-label={`${holiday.holidayName} bookings`}>
              <div className="mhw-holiday-bookings-heading">
                <span>Booked gigs</span>
                <strong>
                  {holiday.scheduledGigCount === 1
                    ? "1 booking"
                    : `${holiday.scheduledGigCount} bookings`}
                </strong>
              </div>
              {holiday.scheduledGigEvents.map((booking) => (
                <button
                  className="mhw-holiday-booking-button"
                  key={booking.id}
                  onClick={() => onSelectBooking(booking)}
                  type="button"
                >
                  <span>{booking.time}</span>
                  <div>
                    <strong>{booking.venue}</strong>
                    <em>{booking.performer || "Performer pending"}</em>
                  </div>
                  <b>View booking details</b>
                </button>
              ))}
            </div>
          ) : (
            <div className="mhw-holiday-open-note">
              <strong>No booked gigs yet.</strong>
              <span>When entertainment is scheduled for this holiday, the booking details will appear here.</span>
            </div>
          )
        ) : null}
      </article>
    );
  });
}

export function HomeHolidayCoverage({
  coveredCount,
  holidays,
  openCount,
  totalCount,
  year,
}: HomeHolidayCoverageProps) {
  const [activeFilter, setActiveFilter] = useState<HolidayFilter | null>(null);
  const [expandedHolidayId, setExpandedHolidayId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetailEvent | null>(null);
  const filteredHolidays = useMemo(() => {
    if (activeFilter === "covered") {
      return holidays.filter((holiday) => holiday.status === "Covered");
    }

    if (activeFilter === "open") {
      return holidays.filter((holiday) => holiday.status === "Open");
    }

    return holidays;
  }, [activeFilter, holidays]);

  useEffect(() => {
    if (!activeFilter && !selectedBooking) return;

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") {
        if (selectedBooking) {
          setSelectedBooking(null);
        } else {
          setActiveFilter(null);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFilter, selectedBooking]);

  return (
    <section className="mhw-shell mhw-holiday-coverage" id="holiday-coverage">
      <div className="mhw-section-heading">
        <p className="mhw-kicker">Holiday Coverage</p>
        <h2>{year} Holiday coverage</h2>
        <p>
          See which {year} key holidays already have live entertainment
          scheduled and which remain open for planning.
        </p>
      </div>

      <div className="mhw-stat-grid mhw-holiday-kpi-grid">
        <HolidayMetricButton
          description="Holidays tracked for this property"
          filter="all"
          label="Key holidays"
          onClick={(filter) => {
            setExpandedHolidayId(null);
            setActiveFilter(filter);
          }}
          value={totalCount}
        />
        <HolidayMetricButton
          description="Holidays with at least one live entertainment booking"
          filter="covered"
          label="Covered holidays"
          onClick={(filter) => {
            setExpandedHolidayId(null);
            setActiveFilter(filter);
          }}
          value={coveredCount}
        />
        <HolidayMetricButton
          description="Holidays still available for entertainment planning"
          filter="open"
          label="Open holidays"
          onClick={(filter) => {
            setExpandedHolidayId(null);
            setActiveFilter(filter);
          }}
          value={openCount}
        />
      </div>

      {activeFilter && !selectedBooking ? (
        <div
          className="mhw-modal-backdrop is-compact"
          onMouseDown={() => {
            setExpandedHolidayId(null);
            setActiveFilter(null);
          }}
          role="presentation"
        >
          <section
            aria-labelledby="holiday-coverage-title"
            aria-modal="true"
            className="mhw-holiday-modal"
            onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
            role="dialog"
          >
            <div className="mhw-modal-header">
              <div>
                <p className="mhw-kicker">Holiday Coverage</p>
                <h2 id="holiday-coverage-title">
                  {filterLabels[activeFilter]} for {year}
                </h2>
                <p>
                  Review holiday schedule coverage and open planning dates for this
                  property.
                </p>
              </div>
              <button
                aria-label="Close holiday coverage"
                onClick={() => {
                  setExpandedHolidayId(null);
                  setActiveFilter(null);
                }}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mhw-modal-body">
              <div className="mhw-holiday-list is-modal-list">
                <HolidayRows
                  expandedHolidayId={expandedHolidayId}
                  holidays={filteredHolidays}
                  onSelectBooking={(booking) => {
                    setSelectedBooking(booking);
                  }}
                  onToggleHoliday={(holidayId) =>
                    setExpandedHolidayId((currentHolidayId) =>
                      currentHolidayId === holidayId ? null : holidayId,
                    )
                  }
                />
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <BookingDetailModal
        event={selectedBooking}
        key={selectedBooking?.id || "holiday-booking-detail"}
        onClose={() => setSelectedBooking(null)}
      />
    </section>
  );
}
