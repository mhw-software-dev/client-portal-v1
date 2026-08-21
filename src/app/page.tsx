import Link from "next/link";
import { redirect } from "next/navigation";

import { Footer, PortalNav } from "@/components/portal-shell";
import { HomeBookingsAtGlance } from "@/components/home-bookings-at-glance";
import { HomeHolidayCoverage } from "@/components/home-holiday-coverage";
import { HomeScheduleValidation } from "@/components/home-schedule-validation";
import {
  getClientCalendarEvents,
  getClientHolidayCoverage,
  getClientProfile,
  getClientScheduleValidation,
  type ClientCalendarEvent,
} from "@/lib/airtable";
import { getAccountManagerContact } from "@/lib/account-managers";
import { getClientPortalSession } from "@/lib/auth";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  weekday: "short",
});

function getEventDate(event: ClientCalendarEvent) {
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

function isSameMonth(date: Date, monthDate: Date) {
  return (
    date.getMonth() === monthDate.getMonth() &&
    date.getFullYear() === monthDate.getFullYear()
  );
}

function formatDateForRequest(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekStart(date: Date) {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());

  return weekStart;
}

function getWeekEndExclusive(weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return weekEnd;
}

function StatCard({
  label,
  note,
  value,
}: {
  label: string;
  note: string;
  value: string;
}) {
  return (
    <article className="mhw-stat-card">
      <p className="mhw-label">{label}</p>
      <strong>{value}</strong>
      <span>{note}</span>
    </article>
  );
}

export default async function Home() {
  const session = await getClientPortalSession();

  if (!session) {
    redirect("/sign-in?reason=session-expired");
  }

  const email = session.email;
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const currentYearStart = new Date(todayOnly.getFullYear(), 0, 1);
  const currentMonthStart = new Date(todayOnly.getFullYear(), todayOnly.getMonth(), 1);
  const nextMonthStart = new Date(todayOnly.getFullYear(), todayOnly.getMonth() + 1, 1);
  const weekStart = getWeekStart(todayOnly);
  const weekEndExclusive = getWeekEndExclusive(weekStart);
  const nextMonthEnd = new Date(todayOnly.getFullYear(), todayOnly.getMonth() + 2, 1);
  const dashboardStartDate =
    weekStart < currentMonthStart ? weekStart : currentMonthStart;
  const holidayYear = todayOnly.getFullYear();
  const nextYearStart = new Date(todayOnly.getFullYear() + 1, 0, 1);
  const validationDateRange = {
    endDate: formatDateForRequest(nextYearStart),
    startDate: formatDateForRequest(currentYearStart),
  };
  const [profile, calendar, holidayCoverage, scheduleValidation] = await Promise.all([
    getClientProfile(email),
    getClientCalendarEvents(email, {
      endDate: formatDateForRequest(nextMonthEnd),
      startDate: formatDateForRequest(dashboardStartDate),
    }),
    getClientHolidayCoverage(email, holidayYear),
    getClientScheduleValidation(email, validationDateRange),
  ]);

  const events = calendar.status === "connected" ? calendar.events : [];
  const validEvents = events
    .map((event) => ({ event, eventDate: getEventDate(event) }))
    .filter(({ eventDate }) => !Number.isNaN(eventDate.getTime()));
  const upcomingEvents = validEvents
    .filter(({ eventDate }) => eventDate >= todayOnly)
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  const thisMonthCount = validEvents.filter(({ eventDate }) =>
    isSameMonth(eventDate, todayOnly),
  ).length;
  const nextMonthCount = validEvents
    .filter(({ eventDate }) => isSameMonth(eventDate, nextMonthStart))
    .length;
  const confirmedScheduleMonths = Math.min(scheduleValidation.validatedCount, 12);
  const remainingScheduleMonths = Math.max(0, 12 - confirmedScheduleMonths);
  const validationValue =
    scheduleValidation.status === "connected"
      ? `${confirmedScheduleMonths} of 12 months`
      : "N/A";
  const validationNote =
    scheduleValidation.status === "connected"
      ? remainingScheduleMonths > 0
        ? `${remainingScheduleMonths} month${
            remainingScheduleMonths === 1 ? "" : "s"
          } remaining this year`
        : "All months are confirmed for this year"
      : "Schedule progress is not available right now";
  const nextEvent = upcomingEvents[0];
  const weeklyBookings = validEvents
    .filter(
      ({ eventDate }) => eventDate >= weekStart && eventDate < weekEndExclusive,
    )
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
    .map(({ event }) => event);
  const hotelName = profile.hotelName || calendar.hotelName || "Your property";
  const accountManager = profile.accountManager || "No MHW Account Manager assigned";
  const accountManagerContact = getAccountManagerContact(profile.accountManager);

  return (
    <>
      <PortalNav active="Home" />
      <main>
        <section className="mhw-hero">
          <div className="mhw-shell mhw-hero-grid">
            <div className="mhw-hero-copy">
              <p className="mhw-kicker">Client Portal</p>
              <h1>Your entertainment calendar, handled.</h1>
              <p>
                Review your property’s upcoming entertainment schedule, performer
                details, and planning status in one polished view.
              </p>
              <div className="mhw-hero-actions">
                <a className="mhw-primary-button" href="#bookings">
                  View upcoming bookings
                </a>
                <Link className="mhw-secondary-button" href="/calendar">
                  Open calendar
                </Link>
              </div>
            </div>
            <aside className="mhw-hero-panel" aria-label="Portal summary">
              <p className="mhw-kicker">Property Overview</p>
              <h2>{hotelName}</h2>
              <div className="mhw-preview-list">
                <div>
                  <span>Account manager</span>
                  <strong>{accountManager}</strong>
                  {accountManagerContact ? (
                    <p className="mhw-contact-stack">
                      <a href={`mailto:${accountManagerContact.email}`}>
                        {accountManagerContact.email}
                      </a>
                      <a href={`tel:${accountManagerContact.tel}`}>
                        {accountManagerContact.phone}
                      </a>
                    </p>
                  ) : null}
                </div>
                <div>
                  <span>This month</span>
                  <strong>{thisMonthCount} scheduled bookings</strong>
                </div>
                <div>
                  <span>Next event</span>
                  <strong>
                    {nextEvent
                      ? `${dateFormatter.format(nextEvent.eventDate)} at ${nextEvent.event.time}`
                      : "No upcoming booking scheduled"}
                  </strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {calendar.status === "connected" ? (
          <HomeBookingsAtGlance
            bookings={weeklyBookings}
            weekStart={formatDateForRequest(weekStart)}
          />
        ) : (
          <section className="mhw-shell mhw-bookings" id="bookings">
            <div className="mhw-section-heading-row">
              <div>
                <p className="mhw-kicker">This Week’s Schedule</p>
                <h2>This week’s schedule</h2>
              </div>
              <Link href="/calendar">View full calendar</Link>
            </div>
            <div className="mhw-booking-list is-premium">
              <div className="mhw-booking-empty">
                <p className="mhw-kicker">Schedule unavailable</p>
                <h3>We could not load the latest schedule.</h3>
                <p>Please refresh the page or contact MHW if this continues.</p>
              </div>
            </div>
          </section>
        )}

        <section className="mhw-shell mhw-dashboard" id="dashboard">
          <div className="mhw-section-heading">
            <p className="mhw-kicker">Dashboard</p>
            <h2>Entertainment overview</h2>
            <p>
              A clear view of your property’s live entertainment schedule,
              planning progress, and upcoming opportunities.
            </p>
          </div>

          <div className="mhw-stat-grid">
            <StatCard
              label="This month’s entertainment"
              note="Scheduled entertainment bookings for this month"
              value={String(thisMonthCount)}
            />
            <StatCard
              label="Next month’s entertainment"
              note="Scheduled entertainment bookings for next month"
              value={String(nextMonthCount)}
            />
            <HomeScheduleValidation
              note={validationNote}
              records={scheduleValidation.records}
              status={scheduleValidation.status}
              value={validationValue}
            />
          </div>
        </section>


        {holidayCoverage.status === "connected" ? (
          <HomeHolidayCoverage
            coveredCount={holidayCoverage.coveredCount}
            holidays={holidayCoverage.holidays}
            openCount={holidayCoverage.openCount}
            totalCount={holidayCoverage.totalCount}
            year={holidayCoverage.holidayYear}
          />
        ) : (
          <section className="mhw-shell mhw-dashboard">
            <div className="mhw-booking-empty mhw-page-empty-state">
              <p className="mhw-kicker">Holiday Coverage</p>
              <h3>Holiday coverage is not available right now.</h3>
              <p>
                Please refresh the page or contact MHW if this continues.
              </p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
