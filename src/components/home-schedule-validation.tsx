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

export function HomeScheduleValidation({
  note,
  records,
  status,
  value,
}: HomeScheduleValidationProps) {
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
        className="mhw-stat-card mhw-validation-kpi-button"
        disabled={!canOpen}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <p className="mhw-label">Planning status</p>
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
                <p className="mhw-kicker">Planning Status</p>
                <h2 id="schedule-validation-title">Remaining year</h2>
                <p>Review which schedule months are planned from this month through year end.</p>
              </div>
              <button
                aria-label="Close schedule validation"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mhw-modal-body">
              {records.length > 0 ? (
                <div className="mhw-validation-table-wrap">
                  <table className="mhw-validation-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Year</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id}>
                          <td>{record.month}</td>
                          <td>{record.year}</td>
                          <td>
                            <span
                              className={
                                record.status === "Schedule Validated"
                                  ? "mhw-validation-status is-validated"
                                  : "mhw-validation-status"
                              }
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mhw-booking-empty">
                  <p className="mhw-kicker">Planning Status</p>
                  <h3>No schedule month records found.</h3>
                  <p>No validation records are currently listed for the rest of the year.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
