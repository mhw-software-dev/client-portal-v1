const AIRTABLE_API_URL = "https://api.airtable.com/v0";

type AirtableFieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { filename?: string; id?: string; name?: string; type?: string; url?: string }
  | Array<string | null | { filename?: string; id?: string; name?: string; type?: string; url?: string }>;

type AirtableRecord = {
  id: string;
  fields: Record<string, AirtableFieldValue>;
};

type AirtableListResponse = {
  offset?: string;
  records?: AirtableRecord[];
};

type AirtableConfig = {
  activeClientsViewId?: string;
  baseId?: string;
  clientEmailField: string;
  clientsTableId?: string;
  gigCodesField: string;
  gigsExcludedGigCode: string;
  gigsHotelLookupField: string;
  gigsTableId?: string;
  hotelContactsEmailField: string;
  hotelContactsHotelField: string;
  hotelContactsPortalField: string;
  hotelContactsTableId?: string;
  hotelContactsTypeAllowed: string;
  hotelContactsTypeField: string;
  hotelNameField: string;
  hotelTimezoneField: string;
  holidayHotelDateField: string;
  holidayHotelGigsField: string;
  holidayHotelHotelField: string;
  holidayHotelHolidayField: string;
  holidayHotelNameField: string;
  holidayHotelTableId?: string;
  steadySchedulesHotelField: string;
  steadySchedulesMonthField: string;
  steadySchedulesMonthStartField: string;
  steadySchedulesStatusField: string;
  steadySchedulesYearField: string;
  steadySchedulesTableId?: string;
  steadySchedulesValidatedStatus: string;
  pat?: string;
};

type CalendarDateRange = {
  endDate?: string;
  startDate?: string;
};

export type ClientCalendarEvent = {
  accountManager: string;
  additionalPerformanceLinks: string;
  hasAssignedPerformer: boolean;
  id: string;
  date: string;
  displayDate: string;
  genres: string;
  hotel: string;
  hotelTimezone: string;
  instrumentation: string;
  modPhone: string;
  notes: string;
  performerBio: string;
  performer: string;
  promoVideo: string;
  socialMediaOrWebsite: string;
  status: "Confirmed" | "Pending" | "Scheduled";
  time: string;
  title: string;
  venue: string;
};

export type AirtableHealthResult = {
  checkedAt: string;
  configured: boolean;
  message: string;
  sampleClientCount?: number;
  status: "connected" | "missing_config" | "error";
};

export type ClientHolidayCoverageItem = {
  date: string;
  displayDate: string;
  holidayName: string;
  id: string;
  scheduledGigCount: number;
  scheduledGigEvents: ClientCalendarEvent[];
  scheduledGigs: string[];
  status: "Covered" | "Open";
};

export type ClientScheduleValidationRecord = {
  id: string;
  month: string;
  status: string;
  year: string;
};

export type ClientScheduleValidationResult = {
  checkedAt: string;
  contactRecordId?: string;
  hotelName?: string;
  message: string;
  openCount: number;
  records: ClientScheduleValidationRecord[];
  status: "connected" | "missing_config" | "not_authorized" | "error";
  totalCount: number;
  validatedCount: number;
};

export type ClientHolidayCoverageResult = {
  checkedAt: string;
  contactRecordId?: string;
  coveredCount: number;
  holidayYear: number;
  holidays: ClientHolidayCoverageItem[];
  hotelName?: string;
  message: string;
  openCount: number;
  status: "connected" | "missing_config" | "not_authorized" | "error";
  totalCount: number;
};

export type ClientCalendarResult = {
  checkedAt: string;
  contactRecordId?: string;
  events: ClientCalendarEvent[];
  hotelName?: string;
  hotelTimezone?: string;
  message: string;
  status: "connected" | "missing_config" | "not_authorized" | "error";
};

export type ClientProfileResult = {
  accountManager?: string;
  checkedAt: string;
  contactRecordId?: string;
  email?: string;
  hotelName?: string;
  hotelTimezone?: string;
  message: string;
  name?: string;
  status: "connected" | "missing_config" | "not_authorized" | "error";
};

export type AuthorizedClientContact = {
  accountManager: string;
  contactRecordId: string;
  email: string;
  hotelName: string;
  hotelRecordId: string;
  hotelTimezone: string;
  name: string;
};

export type ClientAccessCheckResult = {
  checkedAt: string;
  contact?: AuthorizedClientContact;
  message: string;
  status: "authorized" | "missing_config" | "not_authorized" | "error";
};

export function getAirtableConfig(): AirtableConfig {
  return {
    activeClientsViewId: process.env.AIRTABLE_CLIENTS_ACTIVE_VIEW_ID,
    baseId: process.env.AIRTABLE_CLIENT_PORTAL_BASE_ID,
    clientEmailField: process.env.AIRTABLE_CLIENT_EMAIL_FIELD ?? "Email",
    clientsTableId: process.env.AIRTABLE_CLIENTS_TABLE_ID,
    gigCodesField: process.env.AIRTABLE_GIGS_GIG_CODES_FIELD ?? "Gig Codes",
    gigsExcludedGigCode:
      process.env.AIRTABLE_GIGS_EXCLUDED_GIG_CODE ?? "Last Minute Cancellation",
    gigsHotelLookupField:
      process.env.AIRTABLE_GIGS_HOTEL_LOOKUP_FIELD ?? "Hotels (from Gig Codes)",
    gigsTableId: process.env.AIRTABLE_GIGS_TABLE_ID,
    hotelContactsEmailField:
      process.env.AIRTABLE_HOTEL_CONTACTS_EMAIL_FIELD ?? "Email Address",
    hotelContactsHotelField:
      process.env.AIRTABLE_HOTEL_CONTACTS_HOTEL_FIELD ?? "Hotels",
    hotelContactsPortalField:
      process.env.AIRTABLE_HOTEL_CONTACTS_PORTAL_FIELD ?? "Enable Client Portal",
    hotelContactsTableId: process.env.AIRTABLE_HOTEL_CONTACTS_TABLE_ID,
    hotelContactsTypeAllowed:
      process.env.AIRTABLE_HOTEL_CONTACTS_TYPE_ALLOWED ?? "Key Stakeholder",
    hotelContactsTypeField:
      process.env.AIRTABLE_HOTEL_CONTACTS_TYPE_FIELD ?? "Point of Contact Type",
    hotelNameField: process.env.AIRTABLE_HOTEL_NAME_FIELD ?? "Hospitality Client Name",
    hotelTimezoneField: process.env.AIRTABLE_HOTEL_TIMEZONE_FIELD ?? "Timezone",
    holidayHotelDateField:
      process.env.AIRTABLE_HOLIDAY_HOTEL_DATE_FIELD ?? "2026 Date",
    holidayHotelGigsField: process.env.AIRTABLE_HOLIDAY_HOTEL_GIGS_FIELD ?? "Gigs",
    holidayHotelHotelField: process.env.AIRTABLE_HOLIDAY_HOTEL_HOTEL_FIELD ?? "Hotels",
    holidayHotelHolidayField:
      process.env.AIRTABLE_HOLIDAY_HOTEL_HOLIDAY_FIELD ?? "Holiday Record",
    holidayHotelNameField:
      process.env.AIRTABLE_HOLIDAY_HOTEL_NAME_FIELD ?? "Holiday-Hotel",
    holidayHotelTableId:
      process.env.AIRTABLE_HOLIDAY_HOTEL_TABLE_ID ?? "tblFvoQGHwk4FGNKJ",
    steadySchedulesHotelField:
      process.env.AIRTABLE_STEADY_SCHEDULES_HOTEL_FIELD ?? "Hotels",
    steadySchedulesMonthField:
      process.env.AIRTABLE_STEADY_SCHEDULES_MONTH_FIELD ?? "Month",
    steadySchedulesMonthStartField:
      process.env.AIRTABLE_STEADY_SCHEDULES_MONTH_START_FIELD ??
      "Schedule Month Start Date",
    steadySchedulesStatusField:
      process.env.AIRTABLE_STEADY_SCHEDULES_STATUS_FIELD ?? "Status",
    steadySchedulesYearField:
      process.env.AIRTABLE_STEADY_SCHEDULES_YEAR_FIELD ?? "Year",
    steadySchedulesTableId:
      process.env.AIRTABLE_STEADY_SCHEDULES_TABLE_ID ?? "tblk1GGJ29oxvbJFW",
    steadySchedulesValidatedStatus:
      process.env.AIRTABLE_STEADY_SCHEDULES_VALIDATED_STATUS ??
      "Schedule Validated",
    pat: process.env.AIRTABLE_PAT,
  };
}

export function getMissingAirtableConfigKeys(
  scope: "health" | "calendar" | "profile" | "holidays" | "validation" = "health",
) {
  const config = getAirtableConfig();
  const requiredEntries = {
    AIRTABLE_CLIENT_PORTAL_BASE_ID: config.baseId,
    AIRTABLE_CLIENTS_TABLE_ID: config.clientsTableId,
    AIRTABLE_PAT: config.pat,
    ...(
      scope === "calendar" ||
      scope === "profile" ||
      scope === "holidays" ||
      scope === "validation"
      ? {
          AIRTABLE_HOTEL_CONTACTS_TABLE_ID: config.hotelContactsTableId,
        }
      : {}),
    ...(scope === "calendar"
      ? {
          AIRTABLE_GIGS_TABLE_ID: config.gigsTableId,
        }
      : {}),
    ...(scope === "holidays"
      ? {
          AIRTABLE_GIGS_TABLE_ID: config.gigsTableId,
          AIRTABLE_HOLIDAY_HOTEL_TABLE_ID: config.holidayHotelTableId,
        }
      : {}),
    ...(scope === "validation"
      ? {
          AIRTABLE_STEADY_SCHEDULES_TABLE_ID: config.steadySchedulesTableId,
        }
      : {}),
  };

  return Object.entries(requiredEntries)
    .filter(([, value]) => !isConfiguredValue(value))
    .map(([key]) => key);
}



export async function checkClientPortalAccess(
  email: string,
): Promise<ClientAccessCheckResult> {
  const config = getAirtableConfig();
  const missingKeys = getMissingAirtableConfigKeys("profile");
  const checkedAt = new Date().toISOString();

  if (missingKeys.length > 0) {
    return {
      checkedAt,
      message: `Missing client access configuration: ${missingKeys.join(", ")}`,
      status: "missing_config",
    };
  }

  if (!email.trim()) {
    return {
      checkedAt,
      message: "Missing client email.",
      status: "not_authorized",
    };
  }

  try {
    const contact = await findAuthorizedHotelContact(email, config);

    if (!contact) {
      return {
        checkedAt,
        message: "No authorized hotel contact was found for this email.",
        status: "not_authorized",
      };
    }

    const hotelRecordId = getFirstLinkedRecordId(
      contact.fields[config.hotelContactsHotelField],
    );

    if (!hotelRecordId) {
      return {
        checkedAt,
        message: "Authorized contact does not have a linked hotel record.",
        status: "not_authorized",
      };
    }

    const hotel = await airtableGetRecord(config.clientsTableId ?? "", hotelRecordId);
    const contactEmail =
      stringifyField(contact.fields[config.hotelContactsEmailField]) || email;
    const hotelName = getHotelName(hotel, config.hotelNameField);

    if (!hotelName) {
      return {
        checkedAt,
        message: "Linked hotel record does not have a readable hotel name.",
        status: "error",
      };
    }

    return {
      checkedAt,
      contact: {
        accountManager:
          stringifyField(hotel.fields["MHW Account Manager"]) ||
          "No MHW Account Manager assigned",
        contactRecordId: contact.id,
        email: contactEmail,
        hotelName,
        hotelRecordId,
        hotelTimezone: stringifyField(hotel.fields[config.hotelTimezoneField]),
        name:
          stringifyField(contact.fields["Contact Name"]) ||
          getNameFromEmail(contactEmail),
      },
      message: "Client portal access authorized.",
      status: "authorized",
    };
  } catch (error) {
    return {
      checkedAt,
      message:
        error instanceof Error
          ? error.message
          : "Unknown client access connection error.",
      status: "error",
    };
  }
}

export async function getClientScheduleValidation(
  email: string,
  dateRange: Required<CalendarDateRange>,
): Promise<ClientScheduleValidationResult> {
  const config = getAirtableConfig();
  const missingKeys = getMissingAirtableConfigKeys("validation");
  const checkedAt = new Date().toISOString();

  if (missingKeys.length > 0) {
    return {
      checkedAt,
      message: `Missing schedule validation configuration: ${missingKeys.join(", ")}`,
      openCount: 0,
      records: [],
      status: "missing_config",
      totalCount: 0,
      validatedCount: 0,
    };
  }

  if (!email.trim()) {
    return {
      checkedAt,
      message: "Missing client email.",
      openCount: 0,
      records: [],
      status: "not_authorized",
      totalCount: 0,
      validatedCount: 0,
    };
  }

  try {
    const contact = await findAuthorizedHotelContact(email, config);

    if (!contact) {
      return {
        checkedAt,
        message: "No authorized hotel contact was found for this email.",
        openCount: 0,
        records: [],
        status: "not_authorized",
        totalCount: 0,
        validatedCount: 0,
      };
    }

    const hotelRecordId = getFirstLinkedRecordId(
      contact.fields[config.hotelContactsHotelField],
    );

    if (!hotelRecordId) {
      return {
        checkedAt,
        contactRecordId: contact.id,
        message: "Authorized contact does not have a linked hotel record.",
        openCount: 0,
        records: [],
        status: "not_authorized",
        totalCount: 0,
        validatedCount: 0,
      };
    }

    const hotel = await airtableGetRecord(config.clientsTableId ?? "", hotelRecordId);
    const hotelName = getHotelName(hotel, config.hotelNameField);

    if (!hotelName) {
      return {
        checkedAt,
        contactRecordId: contact.id,
        message: "Linked hotel record does not have a readable hotel name.",
        openCount: 0,
        records: [],
        status: "error",
        totalCount: 0,
        validatedCount: 0,
      };
    }

    const scheduleRecords = await findClientScheduleValidationRecords(
      hotelName,
      config,
      dateRange,
    );
    const totalCount = scheduleRecords.length;
    const validatedCount = scheduleRecords.filter(
      (record) =>
        stringifyField(record.fields[config.steadySchedulesStatusField]) ===
        config.steadySchedulesValidatedStatus,
    ).length;

    return {
      checkedAt,
      contactRecordId: contact.id,
      hotelName,
      message:
        totalCount === 1
          ? "Loaded 1 schedule validation record for this property."
          : `Loaded ${totalCount} schedule validation records for this property.`,
      openCount: totalCount - validatedCount,
      records: scheduleRecords.map((record) =>
        mapScheduleValidationRecord(record, config),
      ),
      status: "connected",
      totalCount,
      validatedCount,
    };
  } catch (error) {
    return {
      checkedAt,
      message:
        error instanceof Error
          ? error.message
          : "Unknown schedule validation connection error.",
      openCount: 0,
      records: [],
      status: "error",
      totalCount: 0,
      validatedCount: 0,
    };
  }
}

export async function getClientHolidayCoverage(
  email: string,
  holidayYear = new Date().getFullYear(),
): Promise<ClientHolidayCoverageResult> {
  const config = getAirtableConfig();
  const missingKeys = getMissingAirtableConfigKeys("holidays");
  const checkedAt = new Date().toISOString();

  if (missingKeys.length > 0) {
    return {
      checkedAt,
      coveredCount: 0,
      holidayYear,
      holidays: [],
      message: `Missing holiday configuration: ${missingKeys.join(", ")}`,
      openCount: 0,
      status: "missing_config",
      totalCount: 0,
    };
  }

  if (!email.trim()) {
    return {
      checkedAt,
      coveredCount: 0,
      holidayYear,
      holidays: [],
      message: "Missing client email.",
      openCount: 0,
      status: "not_authorized",
      totalCount: 0,
    };
  }

  try {
    const contact = await findAuthorizedHotelContact(email, config);

    if (!contact) {
      return {
        checkedAt,
        coveredCount: 0,
        holidayYear,
        holidays: [],
        message: "No authorized hotel contact was found for this email.",
        openCount: 0,
        status: "not_authorized",
        totalCount: 0,
      };
    }

    const hotelRecordId = getFirstLinkedRecordId(
      contact.fields[config.hotelContactsHotelField],
    );

    if (!hotelRecordId) {
      return {
        checkedAt,
        contactRecordId: contact.id,
        coveredCount: 0,
        holidayYear,
        holidays: [],
        message: "Authorized contact does not have a linked hotel record.",
        openCount: 0,
        status: "not_authorized",
        totalCount: 0,
      };
    }

    const hotel = await airtableGetRecord(config.clientsTableId ?? "", hotelRecordId);
    const hotelName = getHotelName(hotel, config.hotelNameField);

    if (!hotelName) {
      return {
        checkedAt,
        contactRecordId: contact.id,
        coveredCount: 0,
        holidayYear,
        holidays: [],
        message: "Linked hotel record does not have a readable hotel name.",
        openCount: 0,
        status: "error",
        totalCount: 0,
      };
    }

    const holidayRecords = await findClientHolidayHotelRecords(hotelName, config);
    const holidayGigIds = [
      ...new Set(
        holidayRecords.flatMap((record) =>
          getLinkedRecordIds(record.fields[config.holidayHotelGigsField]),
        ),
      ),
    ];
    const holidayGigRecords = await findHolidayGigRecords(holidayGigIds, config);
    const holidayGigEventMap = new Map(
      holidayGigRecords.map((gig) => [
        gig.id,
        mapGigRecordToCalendarEvent(gig, hotelName, stringifyField(hotel.fields[config.hotelTimezoneField])),
      ]),
    );
    const holidays = holidayRecords
      .map((record) => mapHolidayHotelRecord(record, config, holidayGigEventMap))
      .filter((holiday) => getYearFromDateValue(holiday.date) === holidayYear)
      .sort((a, b) => getDateSortValue(a.date) - getDateSortValue(b.date));
    const coveredCount = holidays.filter((holiday) => holiday.status === "Covered").length;
    const totalCount = holidays.length;

    return {
      checkedAt,
      contactRecordId: contact.id,
      coveredCount,
      holidayYear,
      holidays,
      hotelName,
      message:
        totalCount === 1
          ? "Loaded 1 holiday coverage record for this property."
          : `Loaded ${totalCount} holiday coverage records for this property.`,
      openCount: totalCount - coveredCount,
      status: "connected",
      totalCount,
    };
  } catch (error) {
    return {
      checkedAt,
      coveredCount: 0,
      holidayYear,
      holidays: [],
      message:
        error instanceof Error
          ? error.message
          : "Unknown holiday coverage connection error.",
      openCount: 0,
      status: "error",
      totalCount: 0,
    };
  }
}

export async function getClientProfile(email: string): Promise<ClientProfileResult> {
  const config = getAirtableConfig();
  const missingKeys = getMissingAirtableConfigKeys("profile");
  const checkedAt = new Date().toISOString();

  if (missingKeys.length > 0) {
    return {
      checkedAt,
      message: `Missing profile configuration: ${missingKeys.join(", ")}`,
      status: "missing_config",
    };
  }

  if (!email.trim()) {
    return {
      checkedAt,
      message: "Missing client email.",
      status: "not_authorized",
    };
  }

  try {
    const contact = await findAuthorizedHotelContact(email, config);

    if (!contact) {
      return {
        checkedAt,
        message: "No authorized client profile was found for this email.",
        status: "not_authorized",
      };
    }

    const hotelRecordId = getFirstLinkedRecordId(
      contact.fields[config.hotelContactsHotelField],
    );

    if (!hotelRecordId) {
      return {
        checkedAt,
        contactRecordId: contact.id,
        message: "Authorized contact does not have a linked hotel record.",
        status: "not_authorized",
      };
    }

    const hotel = await airtableGetRecord(config.clientsTableId ?? "", hotelRecordId);
    const hotelName = getHotelName(hotel, config.hotelNameField);
    const hotelTimezone = stringifyField(hotel.fields[config.hotelTimezoneField]);
    const contactEmail = stringifyField(contact.fields[config.hotelContactsEmailField]) || email;
    const name = stringifyField(contact.fields["Contact Name"]) || getNameFromEmail(contactEmail);
    const accountManager =
      stringifyField(hotel.fields["MHW Account Manager"]) ||
      "No MHW Account Manager assigned";

    return {
      accountManager,
      checkedAt,
      contactRecordId: contact.id,
      email: contactEmail,
      hotelName,
      hotelTimezone,
      message: "Client profile loaded.",
      name,
      status: "connected",
    };
  } catch (error) {
    return {
      checkedAt,
      message:
        error instanceof Error
          ? error.message
          : "Unknown profile connection error.",
      status: "error",
    };
  }
}

function isConfiguredValue(value?: string) {
  if (!value) return false;

  const normalized = value.trim().toLowerCase();
  return !normalized.startsWith("your_") && !normalized.includes("placeholder");
}

export async function checkAirtableHealth(): Promise<AirtableHealthResult> {
  const config = getAirtableConfig();
  const missingKeys = getMissingAirtableConfigKeys();
  const checkedAt = new Date().toISOString();

  if (missingKeys.length > 0) {
    return {
      checkedAt,
      configured: false,
      message: `Missing schedule configuration: ${missingKeys.join(", ")}`,
      status: "missing_config",
    };
  }

  try {
    const body = await airtableListRecords(config.clientsTableId ?? "", {
      pageSize: 1,
      view: config.activeClientsViewId,
    });

    return {
      checkedAt,
      configured: true,
      message: "Client source is reachable.",
      sampleClientCount: body.records.length,
      status: "connected",
    };
  } catch (error) {
    return {
      checkedAt,
      configured: true,
      message:
        error instanceof Error
          ? error.message
          : "Unknown schedule connection error.",
      status: "error",
    };
  }
}

export async function getClientCalendarEvents(
  email: string,
  dateRange: CalendarDateRange = {},
): Promise<ClientCalendarResult> {
  const config = getAirtableConfig();
  const missingKeys = getMissingAirtableConfigKeys("calendar");
  const checkedAt = new Date().toISOString();

  if (missingKeys.length > 0) {
    return {
      checkedAt,
      events: [],
      message: `Missing schedule configuration: ${missingKeys.join(", ")}`,
      status: "missing_config",
    };
  }

  if (!email.trim()) {
    return {
      checkedAt,
      events: [],
      message: "Missing client email.",
      status: "not_authorized",
    };
  }

  try {
    const contact = await findAuthorizedHotelContact(email, config);

    if (!contact) {
      return {
        checkedAt,
        events: [],
        message: "No authorized hotel contact was found for this email.",
        status: "not_authorized",
      };
    }

    const hotelRecordId = getFirstLinkedRecordId(
      contact.fields[config.hotelContactsHotelField],
    );

    if (!hotelRecordId) {
      return {
        checkedAt,
        contactRecordId: contact.id,
        events: [],
        message: "Authorized contact does not have a linked hotel record.",
        status: "not_authorized",
      };
    }

    const hotel = await airtableGetRecord(config.clientsTableId ?? "", hotelRecordId);
    const hotelName = getHotelName(hotel, config.hotelNameField);
    const hotelTimezone = stringifyField(hotel.fields[config.hotelTimezoneField]);

    if (!hotelName) {
      return {
        checkedAt,
        contactRecordId: contact.id,
        events: [],
        message: "Linked hotel record does not have a readable hotel name.",
        status: "error",
      };
    }

    const gigs = await findClientGigs(hotelName, config, dateRange);

    return {
      checkedAt,
      contactRecordId: contact.id,
      events: gigs.map((gig) =>
        mapGigRecordToCalendarEvent(gig, hotelName, hotelTimezone),
      ),
      hotelName,
      hotelTimezone,
      message:
        gigs.length === 1
          ? "Loaded 1 scheduled booking for this property."
          : `Loaded ${gigs.length} scheduled bookings for this property.`,
      status: "connected",
    };
  } catch (error) {
    return {
      checkedAt,
      events: [],
      message:
        error instanceof Error
          ? error.message
          : "Unknown schedule connection error.",
      status: "error",
    };
  }
}

async function findAuthorizedHotelContact(email: string, config: AirtableConfig) {
  const formula = `AND(LOWER({${config.hotelContactsEmailField}}) = '${escapeFormulaString(
    email.toLowerCase().trim(),
  )}', OR({${config.hotelContactsPortalField}} = 1, FIND('${escapeFormulaString(
    config.hotelContactsTypeAllowed,
  )}', ARRAYJOIN({${config.hotelContactsTypeField}}, ',')) > 0))`;

  const response = await airtableListRecords(config.hotelContactsTableId ?? "", {
    filterByFormula: formula,
    pageSize: 1,
  });

  return response.records[0];
}


async function findClientScheduleValidationRecords(
  hotelName: string,
  config: AirtableConfig,
  dateRange: Required<CalendarDateRange>,
) {
  const formulaParts = [
    `FIND('${escapeFormulaString(hotelName)}', ARRAYJOIN({${config.steadySchedulesHotelField}}, ',')) > 0`,
    `LEN({${config.steadySchedulesMonthField}} & '') > 0`,
    `OR(IS_SAME({${config.steadySchedulesMonthStartField}}, DATETIME_PARSE('${escapeFormulaString(
      dateRange.startDate,
    )}'), 'day'), IS_AFTER({${config.steadySchedulesMonthStartField}}, DATETIME_PARSE('${escapeFormulaString(
      dateRange.startDate,
    )}')))`,
    `IS_BEFORE({${config.steadySchedulesMonthStartField}}, DATETIME_PARSE('${escapeFormulaString(
      dateRange.endDate,
    )}'))`,
  ];
  const formula = `AND(${formulaParts.join(", ")})`;

  const response = await airtableListRecords(config.steadySchedulesTableId ?? "", {
    fields: [
      config.steadySchedulesHotelField,
      config.steadySchedulesMonthField,
      config.steadySchedulesMonthStartField,
      config.steadySchedulesStatusField,
      config.steadySchedulesYearField,
    ],
    filterByFormula: formula,
    pageSize: 100,
    sort: [{ field: config.steadySchedulesMonthStartField, direction: "asc" }],
  });

  return response.records;
}

async function findClientHolidayHotelRecords(hotelName: string, config: AirtableConfig) {
  const formula = `FIND('${escapeFormulaString(hotelName)}', ARRAYJOIN({${config.holidayHotelHotelField}}, ',')) > 0`;

  const response = await airtableListRecords(config.holidayHotelTableId ?? "", {
    fields: [
      config.holidayHotelNameField,
      config.holidayHotelHotelField,
      config.holidayHotelGigsField,
      config.holidayHotelHolidayField,
      config.holidayHotelDateField,
    ],
    filterByFormula: formula,
    pageSize: 100,
  });

  return response.records;
}

async function findHolidayGigRecords(gigIds: string[], config: AirtableConfig) {
  if (gigIds.length === 0) return [];

  const recordIdChecks = gigIds.map(
    (gigId) => `RECORD_ID() = '${escapeFormulaString(gigId)}'`,
  );
  const formula = recordIdChecks.length === 1 ? recordIdChecks[0] : `OR(${recordIdChecks.join(", ")})`;

  const response = await airtableListRecords(config.gigsTableId ?? "", {
    fields: [
      "Date",
      "Gig Date",
      "Gig Time Span",
      "Venue",
      "Musicians",
      "Musician Name",
      "Confirmation",
      "MHW Account Manager (from Hotels) (from Gig Codes)",
      "MOD Phone",
      "Performer Bio Formula",
      "Genres",
      "Instrumentation",
      "Social Media or Website",
      "Performance or Sample (from Musicians)",
      "Promo Video (from Musicians)",
      config.gigsHotelLookupField,
      config.gigCodesField,
    ],
    filterByFormula: formula,
    pageSize: 100,
  });

  return response.records;
}

function mapHolidayHotelRecord(
  record: AirtableRecord,
  config: AirtableConfig,
  holidayGigEventMap: Map<string, ClientCalendarEvent>,
): ClientHolidayCoverageItem {
  const scheduledGigIds = getLinkedRecordIds(record.fields[config.holidayHotelGigsField]);
  const scheduledGigEvents = scheduledGigIds
    .map((gigId) => holidayGigEventMap.get(gigId))
    .filter((event): event is ClientCalendarEvent => Boolean(event));
  const scheduledGigs = scheduledGigEvents.map((event) => event.title);
  const holidayName =
    getHolidayNameFromPrimaryField(
      stringifyField(record.fields[config.holidayHotelNameField]),
    ) ||
    stringifyField(record.fields[config.holidayHotelHolidayField]) ||
    "Holiday";
  const date = stringifyField(record.fields[config.holidayHotelDateField]);

  return {
    date,
    displayDate: formatHolidayDate(date),
    holidayName,
    id: record.id,
    scheduledGigCount: scheduledGigIds.length,
    scheduledGigEvents,
    scheduledGigs,
    status: scheduledGigIds.length > 0 ? "Covered" : "Open",
  };
}

function getHolidayNameFromPrimaryField(primaryField: string) {
  return primaryField.split(" - ")[0]?.trim() || primaryField;
}

function getDateSortValue(dateValue: string) {
  const parsed = parseDateValue(dateValue);
  return parsed ? parsed.getTime() : Number.MAX_SAFE_INTEGER;
}

function getYearFromDateValue(dateValue: string) {
  return parseDateValue(dateValue)?.getFullYear();
}

function parseDateValue(dateValue: string) {
  const value = dateValue.trim();
  if (!value) return undefined;

  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const usDateMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(value);
  if (usDateMatch) {
    const [, month, day, year] = usDateMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatHolidayDate(dateValue: string) {
  const parsed = parseDateValue(dateValue);
  if (!parsed) return "Date pending";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(parsed);
}

async function findClientGigs(
  hotelName: string,
  config: AirtableConfig,
  dateRange: CalendarDateRange,
) {
  const formulaParts = [
    `FIND('${escapeFormulaString(hotelName)}', ARRAYJOIN({${config.gigsHotelLookupField}}, ',')) > 0`,
    `NOT(FIND('${escapeFormulaString(config.gigsExcludedGigCode)}', ARRAYJOIN({${config.gigCodesField}}, ',')))`,
  ];

  if (dateRange.startDate) {
    formulaParts.push(
      `OR(IS_SAME({Date}, DATETIME_PARSE('${escapeFormulaString(
        dateRange.startDate,
      )}'), 'day'), IS_AFTER({Date}, DATETIME_PARSE('${escapeFormulaString(
        dateRange.startDate,
      )}')))`,
    );
  }

  if (dateRange.endDate) {
    formulaParts.push(
      `IS_BEFORE({Date}, DATETIME_PARSE('${escapeFormulaString(dateRange.endDate)}'))`,
    );
  }

  const formula = `AND(${formulaParts.join(", ")})`;

  const response = await airtableListRecords(config.gigsTableId ?? "", {
    fields: [
      "Date",
      "Gig Date",
      "Gig Time Span",
      "Venue",
      "Musicians",
      "Musician Name",
      "Confirmation",
      "MHW Account Manager (from Hotels) (from Gig Codes)",
      "MOD Phone",
      "Performer Bio Formula",
      "Genres",
      "Instrumentation",
      "Social Media or Website",
      "Performance or Sample (from Musicians)",
      "Promo Video (from Musicians)",
      config.gigsHotelLookupField,
      config.gigCodesField,
    ],
    filterByFormula: formula,
    pageSize: 100,
    sort: [{ field: "Date", direction: "asc" }],
  });

  return response.records;
}

async function airtableListRecords(
  tableId: string,
  options: {
    fields?: string[];
    filterByFormula?: string;
    maxRecords?: number;
    pageSize?: number;
    sort?: Array<{ direction: "asc" | "desc"; field: string }>;
    view?: string;
  } = {},
) {
  const config = getAirtableConfig();
  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`${AIRTABLE_API_URL}/${config.baseId}/${tableId}`);
    url.searchParams.set("pageSize", String(options.pageSize ?? 100));

    if (offset) url.searchParams.set("offset", offset);
    if (options.filterByFormula) {
      url.searchParams.set("filterByFormula", options.filterByFormula);
    }
    if (options.maxRecords) url.searchParams.set("maxRecords", String(options.maxRecords));
    if (options.view) url.searchParams.set("view", options.view);

    options.fields?.forEach((field) => url.searchParams.append("fields[]", field));
    options.sort?.forEach((sort, index) => {
      url.searchParams.set(`sort[${index}][field]`, sort.field);
      url.searchParams.set(`sort[${index}][direction]`, sort.direction);
    });

    const body = await airtableFetch<AirtableListResponse>(url);
    records.push(...(body.records ?? []));
    offset = body.offset;
  } while (offset && (!options.maxRecords || records.length < options.maxRecords));

  return { records: options.maxRecords ? records.slice(0, options.maxRecords) : records };
}

async function airtableGetRecord(tableId: string, recordId: string) {
  const config = getAirtableConfig();
  const url = new URL(`${AIRTABLE_API_URL}/${config.baseId}/${tableId}/${recordId}`);

  return airtableFetch<AirtableRecord>(url);
}

async function airtableFetch<T>(url: URL): Promise<T> {
  const config = getAirtableConfig();
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${config.pat}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      `Schedule source returned ${response.status}: ${
        errorBody?.error?.message ?? response.statusText
      }`,
    );
  }

  return response.json() as Promise<T>;
}

function mapGigRecordToCalendarEvent(
  record: AirtableRecord,
  hotelName: string,
  hotelTimezone: string,
): ClientCalendarEvent {
  const date = stringifyField(record.fields["Date"]);
  const displayDate = stringifyField(record.fields["Gig Date"]);
  const time = stringifyField(record.fields["Gig Time Span"]);
  const venue = stringifyField(record.fields.Venue);
  const performer = stringifyField(record.fields["Musician Name"]);
  const confirmation = stringifyField(record.fields.Confirmation);
  const accountManager = stringifyField(
    record.fields["MHW Account Manager (from Hotels) (from Gig Codes)"],
  );
  const modPhone = stringifyField(record.fields["MOD Phone"]);
  const performerBio = stringifyField(record.fields["Performer Bio Formula"]);
  const genres = stringifyField(record.fields.Genres);
  const instrumentation = stringifyField(record.fields.Instrumentation);
  const socialMediaOrWebsite = stringifyField(record.fields["Social Media or Website"]);
  const additionalPerformanceLinks = stringifyField(
    record.fields["Performance or Sample (from Musicians)"],
  );
  const promoVideo = getFirstAttachmentUrl(record.fields["Promo Video (from Musicians)"]);

  return {
    accountManager,
    additionalPerformanceLinks,
    hasAssignedPerformer: hasLinkedRecords(record.fields.Musicians),
    id: record.id,
    date,
    displayDate,
    genres,
    hotel: hotelName,
    hotelTimezone,
    instrumentation,
    modPhone,
    notes: "",
    performerBio,
    performer,
    promoVideo,
    socialMediaOrWebsite,
    status: mapConfirmationToStatus(confirmation),
    time: time || "Time pending",
    title: venue || "Scheduled entertainment",
    venue: venue || "Venue pending",
  };
}

function mapScheduleValidationRecord(
  record: AirtableRecord,
  config: AirtableConfig,
): ClientScheduleValidationRecord {
  const startDate = stringifyField(
    record.fields[config.steadySchedulesMonthStartField],
  );
  const parsedStartDate = parseDateValue(startDate);
  const rawStatus = stringifyField(record.fields[config.steadySchedulesStatusField]);

  return {
    id: record.id,
    month:
      stringifyField(record.fields[config.steadySchedulesMonthField]) ||
      formatMonthName(parsedStartDate),
    status: mapScheduleValidationStatus(rawStatus, config),
    year:
      stringifyField(record.fields[config.steadySchedulesYearField]) ||
      (parsedStartDate ? String(parsedStartDate.getFullYear()) : "Year unavailable"),
  };
}

function mapScheduleValidationStatus(status: string, config: AirtableConfig) {
  if (status === config.steadySchedulesValidatedStatus) return "Schedule Validated";

  return "Pending Schedule";
}

function formatMonthName(date?: Date) {
  if (!date) return "Month unavailable";

  return new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
}

function mapConfirmationToStatus(confirmation: string): ClientCalendarEvent["status"] {
  const normalized = confirmation.toLowerCase();

  if (normalized.includes("confirm")) return "Confirmed";
  if (normalized.includes("pending") || normalized.includes("tentative")) return "Pending";

  return "Scheduled";
}

function getFirstLinkedRecordId(value: AirtableFieldValue) {
  if (!Array.isArray(value)) return undefined;
  const firstValue = value[0];

  if (typeof firstValue === "string") return firstValue;
  return firstValue?.id;
}

function getLinkedRecordIds(value: AirtableFieldValue) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      return item.id || "";
    })
    .filter(Boolean);
}

function hasLinkedRecords(value: AirtableFieldValue) {
  return Array.isArray(value) && value.some((item) => Boolean(item));
}

function getHotelName(record: AirtableRecord, hotelNameField: string) {
  const configuredName = stringifyField(record.fields[hotelNameField]);
  if (configuredName) return configuredName;

  const firstReadableValue = Object.values(record.fields).find((value) => stringifyField(value));
  return stringifyField(firstReadableValue);
}

function getNameFromEmail(email: string) {
  const localPart = email.split("@")[0] || "Client Contact";

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stringifyField(value: AirtableFieldValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item) return "";
        if (typeof item === "string") return item;
        return item.name || item.filename || item.url || item.id || "";
      })
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return value.name || value.filename || value.url || value.id || "";
  }

  return "";
}

function getFirstAttachmentUrl(value: AirtableFieldValue): string {
  if (Array.isArray(value)) {
    const attachment = value.find(
      (item): item is { url?: string } => Boolean(item && typeof item === "object" && item.url),
    );

    return attachment?.url || "";
  }

  if (value && typeof value === "object") return value.url || "";

  return "";
}

function escapeFormulaString(value: string) {
  return value.replaceAll("'", "\\'");
}
