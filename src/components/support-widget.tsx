"use client";

import { FormEvent, useEffect, useState } from "react";

const requestTypes = [
  "Schedule question",
  "Portal issue",
  "Update request",
  "Other",
];

type SubmitState = "idle" | "submitting" | "success" | "error";

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [message, setMessage] = useState("");
  const [requestType, setRequestType] = useState(requestTypes[0]);
  const [status, setStatus] = useState<SubmitState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSupportPanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function closeSupportPanel() {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 180);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "submitting") return;

    setStatus("submitting");
    setStatusMessage("");

    try {
      const response = await fetch("/api/support/request", {
        body: JSON.stringify({
          message,
          pageUrl: window.location.href,
          requestType,
          subject,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json().catch(() => null)) as
        | { error?: string; ok?: boolean }
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error ?? "Request failed.");
      }

      setStatus("success");
      setStatusMessage("Thanks. Your request has been sent to MHW.");
      setMessage("");
      setSubject("");
      setRequestType(requestTypes[0]);
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "We could not send your request right now. Please try again.",
      );
    }
  }

  return (
    <div className="mhw-support-widget" aria-live="polite">
      {isOpen ? (
        <section
          className={`mhw-support-panel${isClosing ? " is-closing" : ""}`}
          aria-label="Contact MHW support"
        >
          <div className="mhw-support-panel-header">
            <div>
              <p className="mhw-kicker">Support</p>
              <h2>Contact MHW</h2>
            </div>
            <button
              aria-label="Close support form"
              className="mhw-support-close"
              onClick={closeSupportPanel}
              type="button"
            >
              ×
            </button>
          </div>

          {status === "success" ? (
            <div className="mhw-support-success">
              <strong>Request sent.</strong>
              <p>{statusMessage}</p>
              <button
                className="mhw-secondary-button"
                onClick={() => {
                  closeSupportPanel();
                  window.setTimeout(() => {
                    setStatus("idle");
                    setStatusMessage("");
                  }, 180);
                }}
                type="button"
              >
                Close
              </button>
            </div>
          ) : (
            <form className="mhw-support-form" onSubmit={handleSubmit}>
              <fieldset className="mhw-support-type-field">
                <legend>What can we help with?</legend>
                <select
                  aria-label="What can we help with?"
                  onChange={(event) => setRequestType(event.target.value)}
                  value={requestType}
                >
                  {requestTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </fieldset>

              <label>
                <span>Subject</span>
                <input
                  maxLength={160}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Short summary"
                  required
                  type="text"
                  value={subject}
                />
              </label>

              <label>
                <span>Message</span>
                <textarea
                  maxLength={2000}
                  minLength={10}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Share the details MHW should know."
                  required
                  rows={5}
                  value={message}
                />
              </label>

              {status === "error" ? (
                <p className="mhw-support-error">{statusMessage}</p>
              ) : null}

              <p className="mhw-support-routing-note">
                Your request will be shared with your assigned MHW account manager.
              </p>

              <button
                className="mhw-support-submit"
                disabled={status === "submitting"}
                type="submit"
              >
                {status === "submitting" ? "Sending…" : "Send request"}
              </button>
            </form>
          )}
        </section>
      ) : null}

      {!isOpen ? (
        <button
          className="mhw-support-launcher"
          onClick={() => {
            setIsOpen(true);
            setIsClosing(false);
            if (status !== "success") return;
            setStatus("idle");
            setStatusMessage("");
          }}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <path d="M10 2.5C5.9 2.5 2.8 5.3 2.8 9C2.8 10.9 3.5 12.5 4.8 13.7L4.2 17.1L7.7 15.4C8.4 15.6 9.2 15.7 10 15.7C14.1 15.7 17.2 12.9 17.2 9C17.2 5.3 14.1 2.5 10 2.5ZM6.6 8.3H13.4V9.7H6.6V8.3ZM6.6 10.7H11.3V12.1H6.6V10.7Z" />
          </svg>
          Need help?
        </button>
      ) : null}
    </div>
  );
}
