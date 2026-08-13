import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";

type SignInEmailInput = {
  expiresAt: string;
  hotelName: string;
  signInUrl: string;
  to: string;
};

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
}

function getPortalName() {
  return process.env.PORTAL_EMAIL_FROM_NAME?.trim() || "MHW Client Portal";
}

function getResendApiKey() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  return apiKey;
}

function formatExpiry(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "shortly";

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function sendClientPortalSignInEmail({
  expiresAt,
  hotelName,
  signInUrl,
  to,
}: SignInEmailInput) {
  const fromAddress = getFromAddress();
  const fromName = getPortalName();
  const expiresAtDisplay = formatExpiry(expiresAt);

  const response = await fetch(RESEND_API_URL, {
    body: JSON.stringify({
      from: `${fromName} <${fromAddress}>`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0b3568; line-height: 1.6; max-width: 620px;">
          <h1 style="font-size: 28px; margin-bottom: 12px;">Sign in to your MHW Client Portal</h1>
          <p>Your secure sign-in link for ${escapeHtml(hotelName)} is ready.</p>
          <p>
            <a href="${escapeHtml(signInUrl)}" style="background: #0b3568; color: #ffffff; display: inline-block; font-weight: 700; padding: 12px 18px; text-decoration: none;">
              Sign in to the Client Portal
            </a>
          </p>
          <p style="color: #4b5563; font-size: 14px;">This link expires ${escapeHtml(expiresAtDisplay)} and can only be used once.</p>
          <p style="color: #4b5563; font-size: 14px;">If you did not request this link, you can safely ignore this email.</p>
        </div>
      `,
      subject: "Your MHW Client Portal sign-in link",
      text: `Sign in to your MHW Client Portal: ${signInUrl}

This link expires ${expiresAtDisplay} and can only be used once.`,
      to,
    }),
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      `Email service returned ${response.status}: ${body?.message ?? response.statusText}`,
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
