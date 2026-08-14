"use client";

import { useFormStatus } from "react-dom";

type AuthContinueFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  token: string;
};

function ContinueButton() {
  const { pending } = useFormStatus();

  return (
    <button aria-busy={pending} disabled={pending} type="submit">
      {pending ? "Opening your portal..." : "Continue to portal"}
    </button>
  );
}

export function AuthContinueForm({ action, token }: AuthContinueFormProps) {
  return (
    <form action={action} className="mhw-auth-form">
      <input name="token" type="hidden" value={token} />
      <ContinueButton />
      <p className="mhw-auth-submit-note" aria-live="polite">
        Your portal will open in a moment after you continue.
      </p>
    </form>
  );
}
