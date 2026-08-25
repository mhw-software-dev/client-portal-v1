"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  BookingDetailModal,
  type BookingDetailEvent,
} from "@/components/booking-detail-modal";

type HomeBooking = BookingDetailEvent & {
  id: string;
};

type WeeklyBookingGroup = {
  date: Date;
  items: HomeBooking[];
  key: string;
};

const dayHeadingFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  weekday: "long",
});

function getEventDate(event: HomeBooking) {
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

function EmptyBookings() {
  return (
    <div className="mhw-booking-empty">
      <p className="mhw-kicker">This Week’s Entertainment</p>
      <h3>No entertainment is scheduled for this week.</h3>
      <p>When live entertainment is scheduled for this week, it will appear here.</p>
    </div>
  );
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function getWeekDays(weekStart: string) {
  const startDate = getDateFromKey(weekStart);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return date;
  });
}

function groupBookingsByWeekDay(bookings: HomeBooking[], weekStart: string) {
  const groupedBookings = new Map<string, HomeBooking[]>();

  bookings.forEach((booking) => {
    const eventDate = getEventDate(booking);

    if (Number.isNaN(eventDate.getTime())) return;

    const key = getLocalDateKey(eventDate);
    const existingItems = groupedBookings.get(key) ?? [];

    groupedBookings.set(key, [...existingItems, booking]);
  });

  return getWeekDays(weekStart).map((date) => {
    const key = getLocalDateKey(date);
    const items = groupedBookings.get(key) ?? [];

    return { date, items, key } satisfies WeeklyBookingGroup;
  });
}

function getDefaultExpandedDay(groups: WeeklyBookingGroup[]) {
  const todayKey = getLocalDateKey(new Date());
  const todayGroup = groups.find((group) => group.key === todayKey);

  if (todayGroup) return todayGroup.key;

  const firstDayWithBookings = groups.find((group) => group.items.length > 0);

  return firstDayWithBookings?.key ?? groups[0]?.key ?? "";
}

export function HomeBookingsAtGlance({
  bookings,
  weekStart,
}: {
  bookings: HomeBooking[];
  weekStart: string;
}) {
  const [selectedBooking, setSelectedBooking] = useState<HomeBooking | null>(null);
  const groupedBookings = useMemo(
    () => groupBookingsByWeekDay(bookings, weekStart),
    [bookings, weekStart],
  );
  const [expandedDay, setExpandedDay] = useState(() =>
    getDefaultExpandedDay(groupedBookings),
  );

  function toggleExpandedDay(dayKey: string) {
    setExpandedDay((currentDay) => (currentDay === dayKey ? "" : dayKey));
  }

  return (
    <section className="mhw-shell mhw-bookings" id="bookings">
      <div className="mhw-section-heading-row">
        <div>
          <p className="mhw-kicker">This Week’s Entertainment</p>
          <h2>This week’s entertainment</h2>
          <p>Expand a day to review the live entertainment scheduled for your property.</p>
        </div>
        <div className="mhw-bookings-heading-actions">
          {bookings.length > 0 ? (
            <span>
              {bookings.length} entertainment booking{bookings.length === 1 ? "" : "s"} this week
            </span>
          ) : null}
        </div>
      </div>

      <div className="mhw-booking-list is-premium is-weekly is-accordion">
        {bookings.length === 0 ? <EmptyBookings /> : null}
        {bookings.length > 0
          ? groupedBookings.map((group) => {
              const isExpanded = expandedDay === group.key;
              const bookingLabel = group.items.length === 1 ? "booking" : "bookings";

              return (
                <section
                  className={`mhw-weekly-booking-group${
                    group.items.length > 0 ? " has-bookings" : ""
                  }${isExpanded ? " is-expanded" : ""}`}
                  key={group.key}
                >
                  <button
                    aria-expanded={isExpanded}
                    className="mhw-weekly-booking-toggle"
                    onClick={() => toggleExpandedDay(group.key)}
                    type="button"
                  >
                    <span>
                      <strong>{dayHeadingFormatter.format(group.date)}</strong>
                      <small>
                        {group.items.length > 0
                          ? "Tap to view scheduled entertainment"
                          : "No entertainment scheduled"}
                      </small>
                    </span>
                    <span className="mhw-weekly-booking-count">
                      {group.items.length} {bookingLabel}
                    </span>
                  </button>

                  {isExpanded ? (
                    <div className="mhw-weekly-booking-items">
                      {group.items.length > 0 ? (
                        group.items.map((booking) => (
                          <button
                            className="mhw-booking-card mhw-booking-card-button"
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            type="button"
                          >
                            <strong>{booking.time}</strong>
                            <div>
                              <h3>{booking.venue}</h3>
                              <p>{booking.performer || "Performer pending"}</p>
                            </div>
                            <span className="mhw-booking-action">View details</span>
                          </button>
                        ))
                      ) : (
                        <div className="mhw-weekly-empty-day">
                          No entertainment scheduled for this day.
                        </div>
                      )}
                    </div>
                  ) : null}
                </section>
              );
            })
          : null}
        {bookings.length > 0 ? (
          <div className="mhw-bookings-preview-note">
            <span>Need the full schedule beyond this week?</span>
            <Link href="/calendar">View full calendar</Link>
          </div>
        ) : null}
      </div>

      <BookingDetailModal
        event={selectedBooking}
        key={selectedBooking?.id || "weekly-booking-detail"}
        onClose={() => setSelectedBooking(null)}
      />
    </section>
  );
}
