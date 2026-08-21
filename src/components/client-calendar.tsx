"use client";

import { BookingDetailModal } from "@/components/booking-detail-modal";
import { type CSSProperties, useEffect, useMemo, useState } from "react";

type CalendarEvent = {
  accountManager?: string;
  additionalPerformanceLinks?: string;
  hasAssignedPerformer?: boolean;
  headshot?: string;
  id: string;
  date: string;
  displayDate?: string;
  genres?: string;
  hotel?: string;
  hotelTimezone?: string;
  instrumentation?: string;
  modPhone?: string;
  time: string;
  title: string;
  venue: string;
  performerBio?: string;
  performer: string;
  promoVideo?: string;
  socialMediaOrWebsite?: string;
  status: "Confirmed" | "Pending" | "Scheduled";
  notes: string;
  outletNumber?: string;
};

type CalendarDay = {
  date: Date;
  day: number;
  key: string;
  muted: boolean;
  today: boolean;
};

type CalendarMode = "Calendar" | "List";
type CalendarRange = "Month" | "Week";

type DaySchedule = {
  dateLabel: string;
  events: CalendarEvent[];
};

type CalendarFetchRange = {
  endDate: string;
  key: string;
  startDate: string;
};

type MonthEventGroup = {
  events: CalendarEvent[];
  time: string;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const calendarRanges: CalendarRange[] = ["Month", "Week"];
const calendarModes: CalendarMode[] = ["Calendar", "List"];

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

const dateLabelFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  weekday: "long",
  year: "numeric",
});

const hotelTimezoneMap: Record<string, string> = {
  CDT: "America/Chicago",
  CST: "America/Chicago",
  EDT: "America/New_York",
  EST: "America/New_York",
  MDT: "America/Denver",
  MST: "America/Denver",
  PDT: "America/Los_Angeles",
  PST: "America/Los_Angeles",
};

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return start;
}

function getEventDate(event: CalendarEvent) {
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

function getEventDateLabel(event: CalendarEvent) {
  return event.displayDate?.trim() || dateLabelFormatter.format(getEventDate(event));
}

function getEventTimeRange(event: CalendarEvent) {
  const matches = [...event.time.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi)];
  if (matches.length === 0) return null;

  const [startMatch, endMatch] = matches;
  const start = parseTimeMatch(startMatch);
  const end = endMatch ? parseTimeMatch(endMatch) : start + 180;

  return {
    duration: Math.max(60, end <= start ? end + 1440 - start : end - start),
    start,
  };
}

function parseTimeMatch(match: RegExpMatchArray) {
  const hour = Number(match[1]);
  const minute = Number(match[2] || "0");
  const period = match[3].toLowerCase();
  const normalizedHour = hour === 12 ? 0 : hour;

  return normalizedHour * 60 + minute + (period === "pm" ? 720 : 0);
}

function getCalendarEventStyle(event: CalendarEvent): CSSProperties {
  const range = getEventTimeRange(event);
  if (!range) return {};

  const heightRem = Math.min(4.6, Math.max(3.15, 2.75 + range.duration / 220));

  return { "--event-height": `${heightRem}rem` } as CSSProperties;
}

function getCalendarStackStyle(events: CalendarEvent[]): CSSProperties {
  const earliestStart = events.reduce<number | null>((earliest, event) => {
    const range = getEventTimeRange(event);
    if (!range) return earliest;

    return earliest === null ? range.start : Math.min(earliest, range.start);
  }, null);

  if (earliestStart === null) return {};

  const dayStart = 8 * 60;
  const dayEnd = 23 * 60;
  const progress = Math.min(1, Math.max(0, (earliestStart - dayStart) / (dayEnd - dayStart)));
  const offsetRem = Math.min(4.5, Math.max(0, progress * 4.5));

  return { "--stack-offset": `${offsetRem}rem` } as CSSProperties;
}

function getSortedEvents(events: CalendarEvent[]) {
  return [...events].sort((eventA, eventB) => {
    const startA = getEventTimeRange(eventA)?.start ?? Number.MAX_SAFE_INTEGER;
    const startB = getEventTimeRange(eventB)?.start ?? Number.MAX_SAFE_INTEGER;

    return startA - startB;
  });
}

function getMonthEventGroups(events: CalendarEvent[]): MonthEventGroup[] {
  const grouped = getSortedEvents(events).reduce<Map<string, CalendarEvent[]>>((groups, event) => {
    const time = event.time.trim() || "Time pending";
    groups.set(time, [...(groups.get(time) || []), event]);
    return groups;
  }, new Map());

  return [...grouped.entries()].map(([time, groupEvents]) => ({ events: groupEvents, time }));
}

function getOutletNumber(event: CalendarEvent) {
  const outletMatch = event.outletNumber?.match(/[1-6]/);
  return outletMatch?.[0] || "default";
}

function buildCalendarDays(monthDate: Date, hotelTimezone?: string): CalendarDay[] {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstGridDate = getStartOfWeek(firstOfMonth);
  const todayKey = getDateKey(getTodayForHotelTimezone(hotelTimezone));

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(firstGridDate, index);
    const key = getDateKey(date);

    return {
      date,
      day: date.getDate(),
      key,
      muted: date.getMonth() !== monthDate.getMonth(),
      today: key === todayKey,
    };
  });
}

function buildWeekDays(focusDate: Date, hotelTimezone?: string): CalendarDay[] {
  const firstWeekDate = getStartOfWeek(focusDate);
  const todayKey = getDateKey(getTodayForHotelTimezone(hotelTimezone));

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(firstWeekDate, index);
    const key = getDateKey(date);

    return {
      date,
      day: date.getDate(),
      key,
      muted: false,
      today: key === todayKey,
    };
  });
}

function getRangeLabel(days: CalendarDay[]) {
  const firstDay = days[0]?.date;
  const lastDay = days[days.length - 1]?.date;

  if (!firstDay || !lastDay) return "";

  return `${shortDateFormatter.format(firstDay)} - ${shortDateFormatter.format(lastDay)}, ${lastDay.getFullYear()}`;
}


function getTodayForHotelTimezone(hotelTimezone?: string) {
  const mappedTimezone = hotelTimezone
    ? hotelTimezoneMap[hotelTimezone.trim().toUpperCase()]
    : undefined;

  if (!mappedTimezone) return new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: mappedTimezone,
    year: "numeric",
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  if (!year || !month || !day) return new Date();

  return new Date(year, month - 1, day);
}

function getTimezoneLabel(hotelTimezone: string) {
  const trimmedTimezone = hotelTimezone.trim();
  return trimmedTimezone ? `Times shown in ${trimmedTimezone}` : "Times shown in property local time";
}


function getIcsDate(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

function getIcsDateTime(date: Date, minutes: number) {
  const eventDate = addDays(date, Math.floor(minutes / 1440));
  const minutesInDay = ((minutes % 1440) + 1440) % 1440;
  const hour = String(Math.floor(minutesInDay / 60)).padStart(2, "0");
  const minute = String(minutesInDay % 60).padStart(2, "0");

  return `${getIcsDate(eventDate)}T${hour}${minute}00`;
}

function getIcsTimestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value?: string) {
  return (value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function getSafeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "schedule";
}

function buildCalendarDownload({
  viewLabel,
  events,
  headerLabel,
  hotelName,
  hotelTimezone,
}: {
  viewLabel: string;
  events: CalendarEvent[];
  headerLabel: string;
  hotelName: string;
  hotelTimezone: string;
}) {
  const timezoneId = hotelTimezoneMap[hotelTimezone.trim().toUpperCase()];
  const timezoneParam = timezoneId ? `;TZID=${timezoneId}` : "";
  const timestamp = getIcsTimestamp();
  const sortedEvents = [...events].sort((eventA, eventB) => {
    const dateDifference = getEventDate(eventA).getTime() - getEventDate(eventB).getTime();
    if (dateDifference !== 0) return dateDifference;

    return (getEventTimeRange(eventA)?.start ?? 0) - (getEventTimeRange(eventB)?.start ?? 0);
  });
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MHW Live Music//Client Portal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcsText(`${hotelName} MHW Schedule`)}`,
  ];

  if (timezoneId) lines.push(`X-WR-TIMEZONE:${timezoneId}`);

  sortedEvents.forEach((event) => {
    const eventDate = getEventDate(event);
    const timeRange = getEventTimeRange(event);
    const title = `${event.venue || event.title}${event.performer ? ` - ${event.performer}` : ""}`;
    const description = [
      event.performer ? `Performer: ${event.performer}` : "",
      event.venue ? `Venue: ${event.venue}` : "",
      event.modPhone ? `MOD Phone: ${event.modPhone}` : "",
      event.accountManager ? `MHW Account Manager: ${event.accountManager}` : "",
    ].filter(Boolean).join("\n");

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${escapeIcsText(event.id)}@mhw-client-portal`);
    lines.push(`DTSTAMP:${timestamp}`);

    if (timeRange) {
      lines.push(`DTSTART${timezoneParam}:${getIcsDateTime(eventDate, timeRange.start)}`);
      lines.push(`DTEND${timezoneParam}:${getIcsDateTime(eventDate, timeRange.start + timeRange.duration)}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${getIcsDate(eventDate)}`);
      lines.push(`DTEND;VALUE=DATE:${getIcsDate(addDays(eventDate, 1))}`);
    }

    lines.push(`SUMMARY:${escapeIcsText(title || "MHW Entertainment Booking")}`);
    lines.push(`LOCATION:${escapeIcsText(event.venue)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");

  return {
    content: `${lines.join("\r\n")}\r\n`,
    filename: `${getSafeFilePart(hotelName)}-${getSafeFilePart(viewLabel)}-${getSafeFilePart(headerLabel)}.ics`,
  };
}

function formatDateForRequest(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildFetchRange({
  calendarMode,
  calendarRange,
  calendarDays,
  visibleMonth,
  weekDays,
}: {
  calendarMode: CalendarMode;
  calendarRange: CalendarRange;
  calendarDays: CalendarDay[];
  visibleMonth: Date;
  weekDays: CalendarDay[];
}): CalendarFetchRange {
  if (calendarRange === "Week") {
    const startDate = formatDateForRequest(weekDays[0].date);
    const endDate = formatDateForRequest(addDays(weekDays[6].date, 1));

    return { endDate, key: `week:${calendarMode}:${startDate}:${endDate}`, startDate };
  }

  if (calendarMode === "List") {
    const startDate = formatDateForRequest(visibleMonth);
    const endDate = formatDateForRequest(addMonths(visibleMonth, 1));

    return { endDate, key: `month:list:${startDate}:${endDate}`, startDate };
  }

  const firstDay = calendarDays[0].date;
  const lastDay = calendarDays[calendarDays.length - 1].date;
  const startDate = formatDateForRequest(firstDay);
  const endDate = formatDateForRequest(addDays(lastDay, 1));

  return { endDate, key: `month:calendar:${startDate}:${endDate}`, startDate };
}

export function ClientCalendar() {
  const today = useMemo(() => new Date(), []);
  const initialFocusDate = useMemo(() => new Date(), []);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>("Calendar");
  const [calendarRange, setCalendarRange] = useState<CalendarRange>("Month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [focusDate, setFocusDate] = useState(initialFocusDate);
  const [hotelName, setHotelName] = useState("Client Property");
  const [hotelTimezone, setHotelTimezone] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [loadedRangeKeys, setLoadedRangeKeys] = useState<string[]>([]);
  const [sourceMessage, setSourceMessage] = useState("Preparing your schedule...");
  const [daySchedule, setDaySchedule] = useState<DaySchedule | null>(null);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);

  const visibleMonth = useMemo(
    () => new Date(focusDate.getFullYear(), focusDate.getMonth(), 1),
    [focusDate],
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, hotelTimezone),
    [hotelTimezone, visibleMonth],
  );
  const weekDays = useMemo(
    () => buildWeekDays(focusDate, hotelTimezone),
    [focusDate, hotelTimezone],
  );

  const monthLabel = monthFormatter.format(visibleMonth);
  const weekLabel = getRangeLabel(weekDays);
  const headerLabel = calendarRange === "Week" ? weekLabel : monthLabel;
  const viewLabel = `${calendarRange} ${calendarMode}`;
  const fetchRange = useMemo(
    () => buildFetchRange({ calendarMode, calendarRange, calendarDays, visibleMonth, weekDays }),
    [calendarMode, calendarRange, calendarDays, visibleMonth, weekDays],
  );

  useEffect(() => {
    if (loadedRangeKeys.includes(fetchRange.key)) {
      return;
    }

    let isMounted = true;

    async function loadCalendarEvents() {
      setIsLoadingEvents(true);
      setSourceMessage("Preparing your schedule...");

      try {
        const searchParams = new URLSearchParams({
          endDate: fetchRange.endDate,
          startDate: fetchRange.startDate,
        });
        const response = await fetch(`/api/calendar/bookings?${searchParams.toString()}`, {
          cache: "no-store",
        });
        const body = (await response.json()) as {
          events?: CalendarEvent[];
          hotelName?: string;
          hotelTimezone?: string;
          message?: string;
          status?: string;
        };

        if (!isMounted) return;

        if (body.status === "connected" && body.events) {
          const validEvents = body.events.filter(
            (event) => !Number.isNaN(getEventDate(event).getTime()),
          );

          setEvents((currentEvents) => {
            const eventsById = new Map(currentEvents.map((event) => [event.id, event]));
            validEvents.forEach((event) => eventsById.set(event.id, event));
            return [...eventsById.values()];
          });
          setHotelName(body.hotelName || validEvents[0]?.hotel || "Client Property");
          setHotelTimezone(body.hotelTimezone || validEvents[0]?.hotelTimezone || "");
          setLoadedRangeKeys((currentKeys) => [...currentKeys, fetchRange.key]);
        } else {
          setEvents([]);
          setLoadedRangeKeys([]);
        }

        setSourceMessage(getClientSafeSourceMessage(body.status));
      } catch (error) {
        if (!isMounted) return;
        console.error("Client calendar load failed", error);
        setSourceMessage("We could not load the latest schedule. Please refresh the page or try again shortly.");
      } finally {
        if (isMounted) setIsLoadingEvents(false);
      }
    }

    loadCalendarEvents();

    return () => {
      isMounted = false;
    };
  }, [fetchRange, loadedRangeKeys]);

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((grouped, event) => {
      const eventDate = getEventDate(event);
      if (Number.isNaN(eventDate.getTime())) return grouped;

      const dateKey = getDateKey(eventDate);
      grouped[dateKey] = [...(grouped[dateKey] || []), event];
      return grouped;
    }, {});
  }, [events]);

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = getEventDate(event);

      if (Number.isNaN(eventDate.getTime())) return false;

      if (calendarRange === "Week") {
        const weekStart = weekDays[0]?.date;
        const weekEnd = weekDays[6]?.date;

        return Boolean(weekStart && weekEnd && eventDate >= weekStart && eventDate <= weekEnd);
      }

      return (
        eventDate.getMonth() === visibleMonth.getMonth() &&
        eventDate.getFullYear() === visibleMonth.getFullYear()
      );
    });
  }, [calendarRange, events, visibleMonth, weekDays]);

  const currentPeriodEvents = visibleEvents.length;
  const summaryPeriodLabel = calendarRange === "Week" ? "Visible week" : "Visible month";

  function handleNavigate(direction: -1 | 1) {
    setFocusDate((current) => {
      if (calendarRange === "Week") return addDays(current, direction * 7);
      return addMonths(current, direction);
    });
  }

  function handleToday() {
    setFocusDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  }

  function selectEvent(event: CalendarEvent) {
    setFocusDate(getEventDate(event));
    setDetailEvent(event);
  }

  function handleDownloadCalendar() {
    if (visibleEvents.length === 0) return;

    const { content, filename } = buildCalendarDownload({
      events: visibleEvents,
      headerLabel,
      hotelName,
      hotelTimezone,
      viewLabel,
    });
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = filename;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <>
      <section className="mhw-calendar-hero">
        <div className="mhw-shell mhw-calendar-hero-grid">
          <div className="mhw-calendar-hero-copy">
            <p className="mhw-kicker">Calendar</p>
            <h1>Your entertainment calendar for {hotelName}.</h1>
            <p>
              Review upcoming entertainment dates, performer assignments, and
              schedule updates in one polished calendar view.
            </p>
          </div>
          <div className="mhw-calendar-summary" aria-label="Calendar summary">
            <div className="mhw-calendar-summary-header">
              <span>{summaryPeriodLabel}</span>
              <strong>Live schedule overview</strong>
            </div>
            <div className="mhw-calendar-summary-cards">
              <article className="mhw-calendar-summary-card is-bookings">
                <strong>{currentPeriodEvents}</strong>
                <span>{calendarRange === "Week" ? "Bookings this week" : "Bookings this month"}</span>
              </article>
            </div>
            <p>Updated from your MHW schedule.</p>
          </div>
        </div>
      </section>

      <section className="mhw-shell mhw-calendar-stage" aria-label="Client schedule calendar">
        <div className="mhw-calendar-toolbar">
          <div className="mhw-calendar-view-controls">
            <span className="mhw-calendar-view-label">Schedule View</span>
            <div className="mhw-calendar-view-switches">
              <div className="mhw-calendar-control-group">
                <span>Range</span>
                <div className="mhw-segmented-control" aria-label="Calendar range">
                  {calendarRanges.map((range) => (
                    <button
                      aria-pressed={calendarRange === range}
                      className={calendarRange === range ? "is-active" : ""}
                      key={range}
                      onClick={() => setCalendarRange(range)}
                      type="button"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mhw-calendar-control-group">
                <span>Format</span>
                <div className="mhw-segmented-control" aria-label="Calendar display format">
                  {calendarModes.map((mode) => (
                    <button
                      aria-pressed={calendarMode === mode}
                      className={calendarMode === mode ? "is-active" : ""}
                      key={mode}
                      onClick={() => setCalendarMode(mode)}
                      type="button"
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mhw-calendar-export">
            <span>{visibleEvents.length} bookings in view</span>
            <button
              disabled={isLoadingEvents || visibleEvents.length === 0}
              onClick={handleDownloadCalendar}
              type="button"
            >
              Download calendar
            </button>
          </div>
        </div>

        <div className="mhw-calendar-layout">
          <div className="mhw-calendar-panel">
            <div className="mhw-calendar-panel-header">
              <div>
                <p className="mhw-kicker">{viewLabel}</p>
                <h2>{headerLabel}</h2>
                <p className="mhw-timezone-note">{getTimezoneLabel(hotelTimezone)}</p>
              </div>
              <div className="mhw-calendar-actions" aria-label="Calendar navigation">
                <button
                  type="button"
                  aria-label={calendarRange === "Week" ? "Previous week" : "Previous month"}
                  onClick={() => handleNavigate(-1)}
                >
                  ‹
                </button>
                <button type="button" onClick={handleToday}>Today</button>
                <button
                  type="button"
                  aria-label={calendarRange === "Week" ? "Next week" : "Next month"}
                  onClick={() => handleNavigate(1)}
                >
                  ›
                </button>
              </div>
            </div>

            {calendarMode === "Calendar" && calendarRange === "Month" ? (
              <CalendarGrid
                days={calendarDays}
                eventsByDate={eventsByDate}
                onOpenDaySchedule={(schedule) => setDaySchedule(schedule)}
                onSelectEvent={selectEvent}
              />
            ) : null}

            {calendarMode === "Calendar" && calendarRange === "Week" ? (
              <WeekView
                days={weekDays}
                eventsByDate={eventsByDate}
                onOpenDaySchedule={(schedule) => setDaySchedule(schedule)}
                onSelectEvent={selectEvent}
              />
            ) : null}

            {calendarMode === "List" ? (
              <ListView events={visibleEvents} periodLabel={headerLabel} onSelectEvent={selectEvent} />
            ) : null}
          </div>
        </div>

      {calendarMode === "Calendar" && calendarRange === "Month" ? (
        <div className="mhw-mobile-agenda" aria-label="Mobile agenda preview">
          <div className="mhw-section-heading-row">
            <div>
              <p className="mhw-kicker">Agenda</p>
              <h2>Upcoming this month</h2>
            </div>
            <span>{visibleEvents.length} bookings</span>
          </div>
          <AgendaList events={visibleEvents} emptyLabel={headerLabel} onSelectEvent={selectEvent} />
        </div>
      ) : null}

      <DayScheduleModal
        daySchedule={daySchedule}
        onClose={() => setDaySchedule(null)}
        onSelectEvent={(event) => {
          setDaySchedule(null);
          selectEvent(event);
        }}
      />
      <BookingDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} />
      {isLoadingEvents || sourceMessage ? (
        <div
          className={
            isLoadingEvents ? "mhw-schedule-toast" : "mhw-schedule-toast is-persistent"
          }
          role="status"
        >
          <span className="mhw-toast-indicator" aria-hidden="true" />
          <p>{isLoadingEvents ? "Preparing your schedule..." : sourceMessage}</p>
        </div>
      ) : null}
    </section>
    </>
  );
}

function getClientSafeSourceMessage(status?: string) {
  if (status === "connected") {
    return "";
  }

  if (status === "not_authorized") {
    return "Please sign in again to view this schedule.";
  }

  if (status === "missing_config") {
    return "Schedule details are not available right now. Please contact MHW if this continues.";
  }

  return "We could not load the latest schedule. Please refresh the page or try again shortly.";
}

function CalendarGrid({
  days,
  eventsByDate,
  onOpenDaySchedule,
  onSelectEvent,
}: {
  days: CalendarDay[];
  eventsByDate: Record<string, CalendarEvent[]>;
  onOpenDaySchedule: (schedule: DaySchedule) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  return (
    <div className="mhw-calendar-grid" role="grid" aria-label="Monthly calendar">
      {weekdayLabels.map((day) => (
        <div className="mhw-calendar-weekday" key={day} role="columnheader">
          {day}
        </div>
      ))}
      {days.map((date) => {
        const dayEvents = eventsByDate[date.key] || [];
        const dayClassNames = [
          "mhw-calendar-day",
          date.muted ? "is-muted" : "",
          date.today ? "is-today" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div className={dayClassNames} key={date.key} role="gridcell">
            <span className="mhw-calendar-date">{date.day}</span>
            <MonthEventStack
              date={date.date}
              events={dayEvents}
              onOpenDaySchedule={onOpenDaySchedule}
              onSelectEvent={onSelectEvent}
            />
          </div>
        );
      })}
    </div>
  );
}

function MonthEventStack({
  date,
  events,
  onOpenDaySchedule,
  onSelectEvent,
}: {
  date: Date;
  events: CalendarEvent[];
  onOpenDaySchedule: (schedule: DaySchedule) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const groups = getMonthEventGroups(events);
  const visibleGroups = groups.slice(0, 3);
  const hiddenCount = groups.slice(3).reduce((count, group) => count + group.events.length, 0);
  const sortedEvents = getSortedEvents(events);
  const dateLabel = dateLabelFormatter.format(date);

  if (events.length === 0) return null;

  return (
    <div className="mhw-calendar-events is-dynamic" style={getCalendarStackStyle(sortedEvents)}>
      {visibleGroups.map((group) => {
        const firstEvent = group.events[0];
        const hasMultipleEvents = group.events.length > 1;

        return (
          <button
            className="mhw-calendar-event"
            data-outlet={getOutletNumber(firstEvent)}
            key={group.time}
            onClick={() => {
              if (hasMultipleEvents) {
                onOpenDaySchedule({ dateLabel, events: group.events });
                return;
              }

              onSelectEvent(firstEvent);
            }}
            style={getCalendarEventStyle(firstEvent)}
            title={`${firstEvent.venue} · ${group.time}`}
            type="button"
          >
            <span className="mhw-calendar-event-copy">
              <strong>{firstEvent.venue}</strong>
              <span className="mhw-calendar-event-time">{group.time}</span>
            </span>
            <span className="mhw-calendar-event-media" aria-hidden="true">
              {firstEvent.headshot ? (
                <img alt="" src={firstEvent.headshot} />
              ) : null}
              {hasMultipleEvents ? (
                <span className="mhw-calendar-count" aria-label={`${group.events.length} schedules`}>
                  {group.events.length}
                </span>
              ) : null}
            </span>
            {hasMultipleEvents ? (
              <span className="mhw-sr-only">
                {group.events.length} bookings at {group.time}
              </span>
            ) : null}
          </button>
        );
      })}
      {hiddenCount > 0 ? (
        <button
          className="mhw-calendar-more"
          onClick={() => onOpenDaySchedule({ dateLabel, events: sortedEvents })}
          type="button"
        >
          +{hiddenCount} more
        </button>
      ) : null}
    </div>
  );
}

function WeekView({
  days,
  eventsByDate,
  onOpenDaySchedule,
  onSelectEvent,
}: {
  days: CalendarDay[];
  eventsByDate: Record<string, CalendarEvent[]>;
  onOpenDaySchedule: (schedule: DaySchedule) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  return (
    <div className="mhw-week-view" role="list" aria-label="Weekly calendar">
      {days.map((date) => {
        const dayEvents = eventsByDate[date.key] || [];

        return (
          <article className={date.today ? "mhw-week-day is-today" : "mhw-week-day"} key={date.key}>
            <div className="mhw-week-date">
              <span>{weekdayLabels[date.date.getDay()]}</span>
              <strong>{date.day}</strong>
            </div>
            {dayEvents.length > 0 ? (
              <WeekEventBoard
                date={date.date}
                events={dayEvents}
                onOpenDaySchedule={onOpenDaySchedule}
                onSelectEvent={onSelectEvent}
              />
            ) : (
              <p className="mhw-empty-agenda">No bookings scheduled.</p>
            )}
          </article>
        );
      })}
    </div>
  );
}

function WeekEventBoard({
  date,
  events,
  onOpenDaySchedule,
  onSelectEvent,
}: {
  date: Date;
  events: CalendarEvent[];
  onOpenDaySchedule: (schedule: DaySchedule) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const groups = getMonthEventGroups(events);
  const dateLabel = dateLabelFormatter.format(date);

  return (
    <div className="mhw-week-board">
      {groups.map((group) => {
        const firstEvent = group.events[0];
        const hasMultipleEvents = group.events.length > 1;

        return (
          <button
            className="mhw-week-booking"
            data-outlet={getOutletNumber(firstEvent)}
            key={group.time}
            onClick={() => {
              if (hasMultipleEvents) {
                onOpenDaySchedule({ dateLabel, events: group.events });
                return;
              }

              onSelectEvent(firstEvent);
            }}
            type="button"
          >
            <span className="mhw-week-booking-time">{group.time}</span>
            <span className="mhw-week-booking-main">
              <strong>{firstEvent.venue}</strong>
              <em>{firstEvent.performer || "Performer pending"}</em>
            </span>
            {hasMultipleEvents ? (
              <span className="mhw-week-booking-count">{group.events.length} schedules</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function ListView({
  events,
  periodLabel,
  onSelectEvent,
}: {
  events: CalendarEvent[];
  periodLabel: string;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  return (
    <div className="mhw-list-view" aria-label="Booking list">
      <div className="mhw-list-view-heading">
        <p className="mhw-kicker">Schedule List</p>
        <h3>{events.length} bookings in {periodLabel}</h3>
      </div>
      <AgendaList events={events} emptyLabel={periodLabel} onSelectEvent={onSelectEvent} />
    </div>
  );
}

function AgendaList({
  emptyLabel,
  events,
  onSelectEvent,
}: {
  emptyLabel: string;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  return (
    <div className="mhw-agenda-list">
      {events.map((event) => (
        <button
          className="mhw-agenda-card"
          key={event.id}
          onClick={() => onSelectEvent(event)}
          type="button"
        >
          <span>{getEventDateLabel(event)}</span>
          <strong>{event.venue}</strong>
          <p>{event.time} · {event.performer}</p>
        </button>
      ))}
      {events.length === 0 ? (
        <p className="mhw-empty-agenda">No bookings scheduled for {emptyLabel}.</p>
      ) : null}
    </div>
  );
}

function DayScheduleModal({
  daySchedule,
  onClose,
  onSelectEvent,
}: {
  daySchedule: DaySchedule | null;
  onClose: () => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  useEffect(() => {
    if (!daySchedule) return;

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [daySchedule, onClose]);

  if (!daySchedule) return null;

  return (
    <div className="mhw-modal-backdrop is-compact" onMouseDown={onClose} role="presentation">
      <section
        aria-labelledby="day-schedule-title"
        aria-modal="true"
        className="mhw-day-schedule-modal"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
        role="dialog"
      >
        <div className="mhw-day-schedule-header">
          <div>
            <p className="mhw-kicker">Daily Schedule</p>
            <h2 id="day-schedule-title">{daySchedule.dateLabel}</h2>
          </div>
          <button aria-label="Close daily schedule" onClick={onClose} type="button">
            ×
          </button>
        </div>
        <div className="mhw-day-schedule-list">
          {getSortedEvents(daySchedule.events).map((event) => (
            <button
              className="mhw-day-schedule-row"
              key={event.id}
              onClick={() => onSelectEvent(event)}
              type="button"
            >
              <span>{event.time}</span>
              <strong>{event.venue}</strong>
              <p>{event.performer || "Performer pending"}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
