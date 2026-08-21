"use client";

import { useEffect, useState } from "react";

import type { ClientScheduleValidationRecord } from "@/lib/airtable";

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

type HomeScheduleValidationProps = {
  note: string;
  records: ClientScheduleValidationRecord[];
  status: "connected" | "missing_config" | "not_authorized" | "error";
  value: string;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getMonthIndex(month: string) {
  const trimmedMonth = month.trim();
  const monthNumber = Number(trimmedMonth);

  if (monthNumber >= 1 && monthNumber <= 12) return monthNumber - 1;

  return monthNames.findIndex(
    (monthName) => monthName.toLowerCase() === trimmedMonth.toLowerCase(),
  );
}

function getScheduleYear(records: ClientScheduleValidationRecord[]) {
  const recordYear = records.find((record) => /^\d{4}$/.test(record.year.trim()))?.year;

  return recordYear || String(new Date().getFullYear());
}

function getClientStatus(status?: string) {
  return status === "Schedule Validated" ? "Confirmed" : "Not confirmed yet";
}

function buildScheduleMonths(records: ClientScheduleValidationRecord[]) {
  const year = getScheduleYear(records);
  const recordsByMonth = new Map<number, ClientScheduleValidationRecord>();

  records.forEach((record) => {
    const monthIndex = getMonthIndex(record.month);
    if (monthIndex >= 0 && !recordsByMonth.has(monthIndex)) {
      recordsByMonth.set(monthIndex, record);
    }
  });

  return monthNames.map((month, index) => {
    const record = recordsByMonth.get(index);

    return {
      id: record?.id || `${year}-${index + 1}`,
      month,
      number: index + 1,
      status: getClientStatus(record?.status),
      year: record?.year || year,
    };
  });
}

export function HomeScheduleValidation({
  note,
  records,
  status,
  value,
}: HomeScheduleValidationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const canOpen = status === "connected";
  const scheduleMonths = buildScheduleMonths(records);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        className="mhw-stat-card mhw-validation-kpi-button"
        disabled={!canOpen}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <p className="mhw-label">Schedule progress</p>
        <strong>{value}</strong>
        <span>{note}</span>
        {canOpen ? <DetailsIcon /> : null}
      </button>

      {isOpen ? (
        <div
          className="mhw-modal-backdrop is-compact"
          onMouseDown={() => setIsOpen(false)}
          role="presentation"
        >
          <section
            aria-labelledby="schedule-validation-title"
            aria-modal="true"
            className="mhw-validation-modal"
            onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
            role="dialog"
          >
            <div className="mhw-modal-header">
              <div>
                <p className="mhw-kicker">Schedule Progress</p>
                <h2 id="schedule-validation-title">Full year overview</h2>
                <p>Review which months are confirmed as the year moves forward.</p>
              </div>
              <button
                aria-label="Close schedule progress"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mhw-modal-body">
              {canOpen ? (
                <div className="mhw-validation-table-wrap">
                  <table className="mhw-validation-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Month</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleMonths.map((month) => (
                        <tr key={month.id}>
                          <td>{month.number}</td>
                          <td>{month.month}</td>
                          <td>
                            <span
                              className={
                                month.status === "Confirmed"
                                  ? "mhw-validation-status is-validated"
                                  : "mhw-validation-status"
                              }
                            >
                              {month.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mhw-booking-empty">
                  <p className="mhw-kicker">Schedule Progress</p>
                  <h3>Schedule progress is not available right now.</h3>
                  <p>Please contact MHW if you need the latest schedule status.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
