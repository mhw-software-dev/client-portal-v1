type SignInErrorNoticeProps = {
  error?: string;
};

const errorMessages: Record<string, { title: string; message: string }> = {
  callback: {
    title: "We could not complete sign in",
    message:
      "Please request a fresh sign-in link and try again. If this continues, contact MHW for help.",
  },
  expired: {
    title: "This sign-in link expired",
    message: "For your security, sign-in links expire. Request a new link below.",
  },
  invalid: {
    title: "This sign-in link is not valid",
    message: "Please request a new link using the email address MHW has on file.",
  },
  unauthorized: {
    title: "Portal access is not available for this email",
    message:
      "Use the email connected to your MHW client contact profile, or contact MHW for access help.",
  },
  used: {
    title: "This sign-in link was already used",
    message:
      "Each secure link can only be completed once. Request a new link below to continue.",
  },
};

export function SignInErrorNotice({ error }: SignInErrorNoticeProps) {
  if (!error) return null;

  const content = errorMessages[error] ?? errorMessages.invalid;

  return (
    <div className="mhw-auth-message is-error mhw-auth-error-notice" role="alert">
      <strong>{content.title}</strong>
      <span>{content.message}</span>
    </div>
  );
}
