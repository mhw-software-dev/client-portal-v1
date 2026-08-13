import "server-only";

import { randomBytes } from "crypto";

import type { AuthorizedClientContact } from "@/lib/airtable";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";
const DEFAULT_TOKEN_TTL_MINUTES = 30;

type AirtableAuthConfig = {
  activeStatus: string;
  appUrl: string;
  baseId?: string;
  contactNameField: string;
  contactRecordIdField: string;
  emailField: string;
  expiredStatus: string;
  expiresAtField: string;
  hotelNameField: string;
  hotelRecordIdField: string;
  ipAddressField: string;
  pat?: string;
  statusField: string;
  tableId?: string;
  tokenField: string;
  usedAtField: string;
  usedStatus: string;
  userAgentField: string;
};

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

type AirtableListResponse = {
  records?: AirtableRecord[];
};

type AirtableCreateResponse = {
  records?: AirtableRecord[];
};

export type ClientPortalSignInToken = {
  expiresAt: string;
  signInUrl: string;
  token: string;
  tokenRecordId: string;
};

export type StoredClientPortalToken = {
  contactRecordId: string;
  email: string;
  expiresAt: string;
  hotelRecordId: string;
  id: string;
  status: string;
  token: string;
  usedAt: string;
};

function getAuthConfig(): AirtableAuthConfig {
  return {
    activeStatus: process.env.AIRTABLE_AUTH_ACTIVE_STATUS ?? "Active",
    appUrl: process.env.PORTAL_APP_URL ?? "http://localhost:3000",
    baseId: process.env.AIRTABLE_AUTH_BASE_ID,
    contactNameField: process.env.AIRTABLE_AUTH_CONTACT_NAME_FIELD ?? "Contact Name",
    contactRecordIdField:
      process.env.AIRTABLE_AUTH_CONTACT_RECORD_ID_FIELD ??
      "Hotel Contact Record ID",
    emailField: process.env.AIRTABLE_AUTH_EMAIL_FIELD ?? "Email",
    expiredStatus: process.env.AIRTABLE_AUTH_EXPIRED_STATUS ?? "Expired",
    expiresAtField: process.env.AIRTABLE_AUTH_EXPIRES_AT_FIELD ?? "Expires At",
    hotelNameField: process.env.AIRTABLE_AUTH_HOTEL_NAME_FIELD ?? "Hotel Name",
    hotelRecordIdField:
      process.env.AIRTABLE_AUTH_HOTEL_RECORD_ID_FIELD ?? "Hotel Record ID",
    ipAddressField: process.env.AIRTABLE_AUTH_IP_ADDRESS_FIELD ?? "IP Address",
    pat: process.env.AIRTABLE_PAT,
    statusField: process.env.AIRTABLE_AUTH_STATUS_FIELD ?? "Status",
    tableId: process.env.AIRTABLE_AUTH_TOKENS_TABLE_ID,
    tokenField: process.env.AIRTABLE_AUTH_TOKEN_FIELD ?? "Token",
    usedAtField: process.env.AIRTABLE_AUTH_USED_AT_FIELD ?? "Used At",
    usedStatus: process.env.AIRTABLE_AUTH_USED_STATUS ?? "Used",
    userAgentField: process.env.AIRTABLE_AUTH_USER_AGENT_FIELD ?? "User Agent",
  };
}

export function getMissingAuthTokenConfigKeys() {
  const config = getAuthConfig();
  const requiredEntries = {
    AIRTABLE_AUTH_BASE_ID: config.baseId,
    AIRTABLE_AUTH_TOKENS_TABLE_ID: config.tableId,
    AIRTABLE_PAT: config.pat,
    PORTAL_APP_URL: config.appUrl,
  };

  return Object.entries(requiredEntries)
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key);
}

export async function createClientPortalSignInToken({
  contact,
  request,
}: {
  contact: AuthorizedClientContact;
  request: Request;
}): Promise<ClientPortalSignInToken> {
  const missingKeys = getMissingAuthTokenConfigKeys();

  if (missingKeys.length > 0) {
    throw new Error(`Missing auth token configuration: ${missingKeys.join(", ")}`);
  }

  const config = getAuthConfig();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + DEFAULT_TOKEN_TTL_MINUTES);

  const createdRecord = await airtableAuthFetch<AirtableCreateResponse>("", {
    body: JSON.stringify({
      records: [
        {
          fields: {
            [config.contactNameField]: contact.name,
            [config.contactRecordIdField]: contact.contactRecordId,
            [config.emailField]: contact.email,
            [config.expiresAtField]: expiresAt.toISOString(),
            [config.hotelNameField]: contact.hotelName,
            [config.hotelRecordIdField]: contact.hotelRecordId,
            [config.ipAddressField]: getRequestIpAddress(request),
            [config.statusField]: config.activeStatus,
            [config.tokenField]: token,
            [config.userAgentField]: request.headers.get("user-agent") ?? "",
          },
        },
      ],
      typecast: true,
    }),
    method: "POST",
  });
  const tokenRecord = createdRecord.records?.[0];

  if (!tokenRecord) {
    throw new Error("Auth token record was not created.");
  }

  return {
    expiresAt: expiresAt.toISOString(),
    signInUrl: `${config.appUrl.replace(/\/$/, "")}/auth/callback?token=${encodeURIComponent(
      token,
    )}`,
    token,
    tokenRecordId: tokenRecord.id,
  };
}

export async function findClientPortalSignInToken(
  token: string,
): Promise<StoredClientPortalToken | null> {
  const missingKeys = getMissingAuthTokenConfigKeys();

  if (missingKeys.length > 0) {
    throw new Error(`Missing auth token configuration: ${missingKeys.join(", ")}`);
  }

  const config = getAuthConfig();
  const formula = `{${config.tokenField}} = '${escapeFormulaString(token)}'`;
  const urlParams = new URLSearchParams({
    filterByFormula: formula,
    pageSize: "1",
  });
  const response = await airtableAuthFetch<AirtableListResponse>(`?${urlParams}`);
  const record = response.records?.[0];

  if (!record) return null;

  return {
    contactRecordId: stringifyField(record.fields[config.contactRecordIdField]),
    email: stringifyField(record.fields[config.emailField]),
    expiresAt: stringifyField(record.fields[config.expiresAtField]),
    hotelRecordId: stringifyField(record.fields[config.hotelRecordIdField]),
    id: record.id,
    status: stringifyField(record.fields[config.statusField]),
    token: stringifyField(record.fields[config.tokenField]),
    usedAt: stringifyField(record.fields[config.usedAtField]),
  };
}

export async function markClientPortalSignInTokenUsed(tokenRecordId: string) {
  const config = getAuthConfig();

  await airtableAuthFetch<AirtableCreateResponse>(`/${tokenRecordId}`, {
    body: JSON.stringify({
      fields: {
        [config.statusField]: config.usedStatus,
        [config.usedAtField]: new Date().toISOString(),
      },
      typecast: true,
    }),
    method: "PATCH",
  });
}

function getRequestIpAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "development" ? "local development" : "")
  );
}

async function airtableAuthFetch<T>(path: string, init: RequestInit = {}) {
  const config = getAuthConfig();
  const response = await fetch(
    `${AIRTABLE_API_URL}/${config.baseId}/${config.tableId}${path}`,
    {
      ...init,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${config.pat}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      `Auth token source returned ${response.status}: ${
        errorBody?.error?.message ?? response.statusText
      }`,
    );
  }

  return response.json() as Promise<T>;
}

function escapeFormulaString(value: string) {
  return value.replace(/'/g, "\\'");
}

function stringifyField(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyField(item))
      .filter(Boolean)
      .join(", ");
  }
  if (value && typeof value === "object" && "name" in value) {
    const namedValue = value as { name?: unknown };
    return typeof namedValue.name === "string" ? namedValue.name : "";
  }

  return "";
}
