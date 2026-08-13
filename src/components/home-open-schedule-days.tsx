"use client";

import { useEffect, useState } from "react";

export type OpenScheduleDay = {
  date: string;
  day: string;
  id: string;
  status: string;
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

type HomeOpenScheduleDaysProps = {
  note: string;
  openDays: OpenScheduleDay[];
  status: "connected" | "missing_config" | "not_authorized" | "error";
  value: string;
};

export function HomeOpenScheduleDays({
  note,
  openDays,
  status,
  value,
}: HomeOpenScheduleDaysProps) {
  const [isOpen, setIsOpen] = useState(false);
  const canOpen = status === "connected";

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
        className="mhw-stat-card mhw-open-days-kpi-button"
        disabled={!canOpen}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <p className="mhw-label">Available planning days</p>
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
            aria-labelledby="open-schedule-days-title"
            aria-modal="true"
            className="mhw-validation-modal"
            onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
            role="dialog"
          >
            <div className="mhw-modal-header">
              <div>
                <p className="mhw-kicker">Available Planning Days</p>
                <h2 id="open-schedule-days-title">Next 90 days</h2>
                <p>Review dates with no client-facing entertainment bookings scheduled.</p>
              </div>
              <button
                aria-label="Close open schedule days"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mhw-modal-body">
              {openDays.length > 0 ? (
                <div className="mhw-validation-table-wrap">
                  <table className="mhw-validation-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openDays.map((openDay) => (
                        <tr key={openDay.id}>
                          <td>{openDay.date}</td>
                          <td>{openDay.day}</td>
                          <td>
                            <span className="mhw-validation-status">
                              {openDay.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mhw-booking-empty">
                  <p className="mhw-kicker">Available Planning Days</p>
                  <h3>No open days found.</h3>
                  <p>Every day in the next 90 days currently has at least one scheduled booking.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
