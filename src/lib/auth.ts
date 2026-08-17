import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { checkClientPortalAccess, type AuthorizedClientContact } from "@/lib/airtable";

export type ClientPortalSession = AuthorizedClientContact & {
  expiresAt: string;
  issuedAt: string;
  tokenRecordId?: string;
};

const SESSION_COOKIE_NAME = "mhw_client_portal_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;


function getDevBypassEmail() {
  if (process.env.NODE_ENV === "production") return "";

  return process.env.CLIENT_PORTAL_DEV_BYPASS_EMAIL?.trim() || "";
}

async function getDevBypassSession() {
  const email = getDevBypassEmail();

  if (!email) return null;

  const accessCheck = await checkClientPortalAccess(email);

  if (accessCheck.status !== "authorized" || !accessCheck.contact) {
    return null;
  }

  return createClientPortalSession(accessCheck.contact);
}

function getSessionSecret() {
  const secret = process.env.PORTAL_SESSION_SECRET?.trim();

  if (!secret) {
    throw new Error("Missing PORTAL_SESSION_SECRET.");
  }

  return secret;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function signaturesMatch(signatureA: string, signatureB: string) {
  const bufferA = Buffer.from(signatureA);
  const bufferB = Buffer.from(signatureB);

  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

function createSessionValue(session: ClientPortalSession) {
  const payload = encodeBase64Url(JSON.stringify(session));
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

function parseSessionValue(value?: string) {
  if (!value) return null;

  const [payload, signature] = value.split(".");

  if (!payload || !signature) return null;

  const expectedSignature = signPayload(payload);

  if (!signaturesMatch(signature, expectedSignature)) return null;

  try {
    const session = JSON.parse(decodeBase64Url(payload)) as ClientPortalSession;
    const expiresAt = new Date(session.expiresAt);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function createClientPortalSession(
  contact: AuthorizedClientContact,
  options: { tokenRecordId?: string } = {},
) {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setSeconds(issuedAt.getSeconds() + SESSION_TTL_SECONDS);

  return {
    ...contact,
    expiresAt: expiresAt.toISOString(),
    issuedAt: issuedAt.toISOString(),
    ...(options.tokenRecordId ? { tokenRecordId: options.tokenRecordId } : {}),
  } satisfies ClientPortalSession;
}

export async function setClientPortalSession(
  contact: AuthorizedClientContact,
  options: { tokenRecordId?: string } = {},
) {
  const session = createClientPortalSession(contact, options);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, createSessionValue(session), {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return session;
}

export async function getClientPortalSession() {
  const devBypassSession = await getDevBypassSession();

  if (devBypassSession) {
    return devBypassSession;
  }

  const cookieStore = await cookies();

  return parseSessionValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function clearClientPortalSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}
