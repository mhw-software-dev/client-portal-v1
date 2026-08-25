"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type RequestState = "idle" | "submitting" | "success" | "error";

const cooldownSecondsTotal = 45;
const neutralMessage =
  "If this email has access, a secure sign-in link will be sent shortly. Please check your inbox and spam folder.";
const genericErrorMessage =
  "We could not request a sign-in link right now. Please try again in a moment.";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const isSubmitting = requestState === "submitting";
  const isCoolingDown = cooldownSeconds > 0;
  const isSubmitDisabled = isSubmitting || isCoolingDown;

  const buttonLabel = useMemo(() => {
    if (isSubmitting) return "Sending...";
    if (isCoolingDown) return `Try again in ${cooldownSeconds}s`;
    return "Send sign-in link";
  }, [cooldownSeconds, isCoolingDown, isSubmitting]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setTimeout(() => {
      setCooldownSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitDisabled) return;

    const normalizedEmail = normalizeEmail(email);
    setEmail(normalizedEmail);

    if (!isValidEmail(normalizedEmail)) {
      setRequestState("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setRequestState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/auth/request-link", {
        body: JSON.stringify({ email: normalizedEmail }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(genericErrorMessage);
      }

      setRequestState("success");
      setMessage(neutralMessage);
      setCooldownSeconds(cooldownSecondsTotal);
    } catch {
      setRequestState("error");
      setMessage(genericErrorMessage);
    }
  }

  return (
    <form className="mhw-auth-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="client-email">Email address</label>
      <input
        aria-describedby="client-email-help"
        autoComplete="email"
        disabled={isSubmitting}
        id="client-email"
        name="email"
        onChange={(event) => {
          setEmail(event.target.value);
          if (requestState === "error") {
            setMessage("");
            setRequestState("idle");
          }
        }}
        placeholder="you@example.com"
        required
        type="email"
        value={email}
      />
      <button disabled={isSubmitDisabled} type="submit">
        {buttonLabel}
      </button>
      {message ? (
        <div
          className={
            requestState === "error"
              ? "mhw-auth-message is-error"
              : "mhw-auth-message"
          }
          role="status"
        >
          <strong>
            {requestState === "error" ? "Unable to send link" : "Check your inbox"}
          </strong>
          <span>{message}</span>
          {requestState === "success" ? (
            <small>
              The email link may open in a new browser tab. Once it opens, you can
              continue there and close this sign-in tab.
            </small>
          ) : null}
        </div>
      ) : (
        <p className="mhw-auth-note" id="client-email-help">
          Links expire for security.
        </p>
      )}
    </form>
  );
}
