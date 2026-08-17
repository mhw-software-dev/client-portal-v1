import "server-only";

import type { ClientPortalSession } from "@/lib/auth";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

type SupportRequestInput = {
  message: string;
  pageUrl: string;
  requestType: string;
  subject: string;
};

type AirtableCreateResponse = {
  records?: Array<{ id: string }>;
};

type SupportRequestConfig = {
  accountManagerField: string;
  baseId?: string;
  clientEmailField: string;
  clientNameField: string;
  hotelField: string;
  messageField: string;
  pageUrlField: string;
  pat?: string;
  requestTypeField: string;
  signInTokenField: string;
  statusField: string;
  statusNew: string;
  subjectField: string;
  submittedAtField: string;
  tableId?: string;
};

function getSupportRequestConfig(): SupportRequestConfig {
  return {
    accountManagerField:
      process.env.AIRTABLE_SUPPORT_ACCOUNT_MANAGER_FIELD ?? "Account Manager",
    baseId: process.env.AIRTABLE_AUTH_BASE_ID,
    clientEmailField:
      process.env.AIRTABLE_SUPPORT_CLIENT_EMAIL_FIELD ?? "Client Email",
    clientNameField:
      process.env.AIRTABLE_SUPPORT_CLIENT_NAME_FIELD ?? "Client Contact Name",
    hotelField: process.env.AIRTABLE_SUPPORT_HOTEL_FIELD ?? "Hotel",
    messageField: process.env.AIRTABLE_SUPPORT_MESSAGE_FIELD ?? "Message",
    pageUrlField: process.env.AIRTABLE_SUPPORT_PAGE_URL_FIELD ?? "Page URL",
    pat: process.env.AIRTABLE_PAT,
    requestTypeField:
      process.env.AIRTABLE_SUPPORT_REQUEST_TYPE_FIELD ?? "Request Type",
    signInTokenField:
      process.env.AIRTABLE_SUPPORT_SIGN_IN_TOKEN_FIELD ?? "Sign In Token",
    statusField: process.env.AIRTABLE_SUPPORT_STATUS_FIELD ?? "Status",
    statusNew: process.env.AIRTABLE_SUPPORT_STATUS_NEW ?? "New",
    subjectField: process.env.AIRTABLE_SUPPORT_SUBJECT_FIELD ?? "Subject",
    submittedAtField:
      process.env.AIRTABLE_SUPPORT_SUBMITTED_AT_FIELD ?? "Submitted At",
    tableId: process.env.AIRTABLE_SUPPORT_REQUESTS_TABLE_ID,
  };
}

export function getMissingSupportRequestConfigKeys() {
  const config = getSupportRequestConfig();
  const requiredEntries = {
    AIRTABLE_AUTH_BASE_ID: config.baseId,
    AIRTABLE_PAT: config.pat,
    AIRTABLE_SUPPORT_REQUESTS_TABLE_ID: config.tableId,
  };

  return Object.entries(requiredEntries)
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key);
}

export async function createClientPortalSupportRequest({
  input,
  session,
}: {
  input: SupportRequestInput;
  session: ClientPortalSession;
}) {
  const missingKeys = getMissingSupportRequestConfigKeys();

  if (missingKeys.length > 0) {
    throw new Error(`Missing support request configuration: ${missingKeys.join(", ")}`);
  }

  const config = getSupportRequestConfig();
  const submittedAt = new Date().toISOString();
  const coreFields: Record<string, unknown> = {
    [config.messageField]: input.message,
    [config.requestTypeField]: input.requestType,
    [config.statusField]: config.statusNew,
    [config.subjectField]: input.subject,
    [config.submittedAtField]: submittedAt,
  };
  const contextFields: Record<string, unknown> = {
    [config.accountManagerField]: session.accountManager,
    [config.clientEmailField]: session.email,
    [config.clientNameField]: session.name,
    [config.hotelField]: session.hotelName,
    [config.pageUrlField]: input.pageUrl,
  };

  if (session.tokenRecordId) {
    contextFields[config.signInTokenField] = [{ id: session.tokenRecordId }];
  }

  try {
    return await createSupportRecord({
      ...coreFields,
      ...contextFields,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Airtable error";

    if (!message.includes("422")) {
      throw error;
    }

    console.warn(
      "Support request context fields could not be saved; retrying with core fields only.",
      { message },
    );

    return createSupportRecord(coreFields);
  }
}

async function createSupportRecord(fields: Record<string, unknown>) {
  const response = await airtableSupportFetch<AirtableCreateResponse>("", {
    body: JSON.stringify({
      records: [{ fields }],
      typecast: true,
    }),
    method: "POST",
  });

  const createdRecord = response.records?.[0];

  if (!createdRecord) {
    throw new Error("Support request record was not created.");
  }

  return createdRecord;
}

async function airtableSupportFetch<T>(path: string, init: RequestInit = {}) {
  const config = getSupportRequestConfig();
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
      `Support request source returned ${response.status}: ${
        errorBody?.error?.message ?? response.statusText
      }`,
    );
  }

  return response.json() as Promise<T>;
}
