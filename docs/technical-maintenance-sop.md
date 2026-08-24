# MHW Client Portal Technical Maintenance SOP

## Purpose

Use this SOP to understand how the MHW Client Portal is implemented, what systems it depends on, how to run it locally, and how to deploy or troubleshoot it.

## Project Summary

The MHW Client Portal is a custom Next.js application for hotel clients. It lets approved hotel contacts securely sign in and review their property's live entertainment schedule, performer details, holiday coverage, schedule progress, this month and next month's entertainment counts, and calendar exports.

The portal uses Airtable as the backend data source, Resend for sign-in emails, GitHub for source control, and Vercel for hosting.

## Tech Stack

- Framework: Next.js App Router
- Language: TypeScript
- Styling: global CSS in `src/app/globals.css`
- Hosting: Vercel
- Source control: GitHub
- Database/source data: Airtable
- Email delivery: Resend
- Authentication: custom magic-link flow using Airtable token records and signed session cookies

## Project Location

Local folder:

```bash
/Users/jersonespinola/Documents/Jerson/MHW/client-portal-v1
```

GitHub repo:

```bash
git@github.com-mhw:mhw-software-dev/client-portal-v1.git
```

Production deploys are handled by Vercel from the `main` branch.

## Main Application Files

- `src/app/page.tsx`: Home dashboard.
- `src/app/calendar/page.tsx`: Calendar page.
- `src/app/profile/page.tsx`: Profile page.
- `src/app/sign-in/page.tsx`: Sign-in page.
- `src/app/auth/callback/page.tsx`: Magic-link verification page.
- `src/app/auth/logout/route.ts`: Logout route.
- `src/app/api/auth/request-link/route.ts`: Creates sign-in token and sends email.
- `src/app/api/calendar/bookings/route.ts`: Calendar data API.
- `src/app/api/health/airtable/route.ts`: Airtable health check.
- `src/lib/airtable.ts`: Airtable data fetching and portal data shaping.
- `src/lib/auth.ts`: Session creation, validation, and cookies.
- `src/lib/auth-tokens.ts`: Sign-in token creation, verification, and status updates.
- `src/lib/email.ts`: Resend email sending.
- `src/lib/account-managers.ts`: Known account manager contact details.
- `src/components/portal-shell.tsx`: Shared header/footer layout.
- `src/components/client-calendar.tsx`: Interactive calendar UI.
- `src/components/booking-detail-modal.tsx`: Booking details modal.
- `src/components/home-bookings-at-glance.tsx`: This week's entertainment.
- `src/components/home-holiday-coverage.tsx`: Holiday coverage cards and modal.
- `src/components/home-schedule-validation.tsx`: Schedule progress KPI and modal backed by Steady Schedules data.

## Airtable Data Model

### Booking Operations Base

The main client-facing data comes from the Booking Operations base.

Configured with:

```bash
AIRTABLE_CLIENT_PORTAL_BASE_ID
AIRTABLE_CLIENTS_TABLE_ID
AIRTABLE_GIGS_TABLE_ID
AIRTABLE_HOTEL_CONTACTS_TABLE_ID
AIRTABLE_HOLIDAY_HOTEL_TABLE_ID
AIRTABLE_STEADY_SCHEDULES_TABLE_ID
```

### Hotel Contacts

Hotel Contacts controls who can access the portal.

Access is granted when:

- `Email Address` is populated
- AND `Point of Contact Type` contains `Key Stakeholder`
- OR `Enable Client Portal` is checked

Important variables:

```bash
AIRTABLE_HOTEL_CONTACTS_EMAIL_FIELD
AIRTABLE_HOTEL_CONTACTS_HOTEL_FIELD
AIRTABLE_HOTEL_CONTACTS_PORTAL_FIELD
AIRTABLE_HOTEL_CONTACTS_TYPE_FIELD
AIRTABLE_HOTEL_CONTACTS_TYPE_ALLOWED
```

### Hotels

Hotels provides the client property, timezone, and account manager context.

Important fields:

- `Hospitality Client Name`
- `Timezone`
- account manager lookup fields used in the portal

Timezone is used so the portal and calendar export show the schedule in the hotel's timezone, not the user's device timezone.

### Gigs

Gigs provides the schedule shown to clients.

Important fields include:

- `Date`
- `Gig Date`
- `Gig Time Span`
- `Venue`
- `Musicians`
- `Musician Name`
- `Headshot`
- `Performer Bio Formula`
- `Genres`
- `Instrumentation`
- `Social Media or Website`
- `Performance or Sample (from Musicians)`
- `Promo Video (from Musicians)`
- `MOD Phone`
- `MHW Account Manager (from Hotels) (from Gig Codes)`
- `Hotels (from Gig Codes)`
- `Gig Codes`
- `Outlet Number (from Gig Codes)`
- `Created`
- `Client Visible Last Modified`

The portal excludes gigs where `Gig Codes` matches:

```bash
AIRTABLE_GIGS_EXCLUDED_GIG_CODE=Last Minute Cancellation
```

The combined `Social Media or Website` source field is split in the booking details modal for display. Social links and website links appear as separate tiles when available; if neither value exists, the modal shows an empty-state contact tile.

The calendar hero summary uses `Created` to show bookings added since Sunday and the latest visible booking addition. `Client Visible Last Modified` remains available as a configured field for future client-visible update summaries if needed.

### Holiday-Hotel

Holiday-Hotel powers the annual holiday coverage section.

Important fields:

- `Holiday-Hotel`
- `Hotels`
- `Holiday Record`
- `Gigs`
- `2026 Date`

The portal counts:

- Key holidays tracked
- Covered holidays
- Open holidays

Covered means the holiday has at least one linked gig.

### Steady Schedules By Month

Steady Schedules by Month powers the client-facing schedule progress section.

Important fields:

- `Hotels`
- `Month`
- `Year`
- `Status`
- `Schedule Month Start Date`

The portal displays all 12 months in the current year and counts how many schedule months are confirmed. The raw Airtable validated status is shown to clients as `Confirmed`.

Validated status:

```bash
AIRTABLE_STEADY_SCHEDULES_VALIDATED_STATUS=Schedule Validated
```

## Authentication Implementation

The client portal uses a custom magic-link sign-in flow.

### Why Magic Links

Magic links avoid requiring hotel clients to manage passwords. Access is controlled by Airtable, so MHW can approve or remove users by updating Hotel Contacts.

### Sign-In Flow

1. User enters email on `/sign-in`.
2. `src/app/api/auth/request-link/route.ts` receives the request.
3. The app checks Hotel Contacts in Airtable.
4. If the contact is approved, the app creates a token record in the auth token table.
5. Resend sends a secure sign-in email.
6. User clicks the email link.
7. `/auth/callback` verifies the token.
8. User clicks `Continue to portal`.
9. The app creates a signed session cookie.
10. User is redirected to the Home dashboard.

### Token Storage

Sign-in tokens live in a separate Airtable base/table so token records do not increase record count in the production Booking Operations base.

Required variables:

```bash
AIRTABLE_AUTH_BASE_ID
AIRTABLE_AUTH_TOKENS_TABLE_ID
```

Default token table fields:

- `Token`
- `Email`
- `Expires At`
- `Used At`
- `Created At`
- `User Agent`
- `IP Address`
- `Status`
- `Contact Name`
- `Hotel Name`
- `Contact Record ID`
- `Hotel Record ID`

Token statuses:

- `Active`
- `Used`
- `Expired`

### Session Cookies

Session handling lives in `src/lib/auth.ts`.

The session cookie is signed using:

```bash
PORTAL_SESSION_SECRET
```

Use a long random value. Changing this secret logs out existing sessions.

### Local Test Bypass

For local development only:

```bash
CLIENT_PORTAL_DEV_BYPASS_EMAIL
```

This lets the developer test as a selected hotel contact without requesting a magic link. It is ignored in production.

## Email Implementation

Resend sends the sign-in link email.

Required variables:

```bash
RESEND_API_KEY
RESEND_FROM_EMAIL
PORTAL_EMAIL_FROM_NAME
PORTAL_APP_URL
```

Important notes:

- `PORTAL_APP_URL` must match the deployed portal URL in production.
- If this URL is wrong, magic links may open the wrong site.
- On Resend's free plan, using the default sender is fine for testing.
- For production, use a verified MHW domain when available.

## Calendar Implementation

The calendar is rendered by `src/components/client-calendar.tsx`.

Supported range options:

- Month
- Week

Supported format options:

- Calendar
- List

Important behavior:

- The calendar fetches the relevant schedule window from the API instead of loading unlimited records.
- Range and format interactions request data for the visible date range.
- The calendar hero shows bookings in view, bookings added since Sunday, and the latest visible booking addition.
- The `Added this week` row opens a modal with the underlying newly added bookings.
- Gigs are plotted using the Airtable `Date` field.
- Display text uses venue and gig time span.
- Times are shown in the hotel's timezone.
- Downloaded calendar events use timezone-aware event data.
- Booking detail modals can be opened from calendar bookings, weekly entertainment, and holiday coverage.
- A top green progress bar appears during route navigation and calendar data loading.
- The calendar loading/status toast is centered near the bottom and positioned above the support widget on mobile.

## Home Dashboard Implementation

The Home dashboard contains:

- Hero/property overview
- This week's entertainment
- Schedule overview KPIs
- Holiday coverage

### This Week's Entertainment

The current day expands by default. If the current day is outside the shown week, the first day with bookings opens.

### Schedule Progress

Shows confirmed schedule months across the current year.

### Monthly Entertainment

Shows this month and next month's scheduled entertainment counts as quick dashboard KPIs.

### Holiday Coverage

Uses Holiday-Hotel records for the current year and shows:

- Key holidays
- Covered holidays
- Open holidays

Clicking the cards opens a modal with the underlying holiday records.

## Environment Variables

Environment variables are stored in:

- Local: `.env.local`
- Production/Preview: Vercel project settings

Do not commit `.env.local`.

Core variables:

```bash
AIRTABLE_PAT
AIRTABLE_CLIENT_PORTAL_BASE_ID
AIRTABLE_CLIENTS_TABLE_ID
AIRTABLE_CLIENTS_ACTIVE_VIEW_ID
AIRTABLE_GIGS_TABLE_ID
AIRTABLE_HOTEL_CONTACTS_TABLE_ID
AIRTABLE_CLIENT_EMAIL_FIELD
CLIENT_PORTAL_DEV_BYPASS_EMAIL
AIRTABLE_HOTEL_CONTACTS_EMAIL_FIELD
AIRTABLE_HOTEL_CONTACTS_HOTEL_FIELD
AIRTABLE_HOTEL_CONTACTS_PORTAL_FIELD
AIRTABLE_HOTEL_CONTACTS_TYPE_FIELD
AIRTABLE_HOTEL_CONTACTS_TYPE_ALLOWED
AIRTABLE_HOTEL_NAME_FIELD
AIRTABLE_HOTEL_TIMEZONE_FIELD
AIRTABLE_GIGS_HOTEL_LOOKUP_FIELD
AIRTABLE_GIGS_GIG_CODES_FIELD
AIRTABLE_GIGS_EXCLUDED_GIG_CODE
AIRTABLE_GIGS_CREATED_TIME_FIELD
AIRTABLE_GIGS_LAST_MODIFIED_FIELD
AIRTABLE_HOLIDAY_HOTEL_TABLE_ID
AIRTABLE_HOLIDAY_HOTEL_NAME_FIELD
AIRTABLE_HOLIDAY_HOTEL_HOTEL_FIELD
AIRTABLE_HOLIDAY_HOTEL_GIGS_FIELD
AIRTABLE_HOLIDAY_HOTEL_HOLIDAY_FIELD
AIRTABLE_HOLIDAY_HOTEL_DATE_FIELD
AIRTABLE_STEADY_SCHEDULES_TABLE_ID
AIRTABLE_STEADY_SCHEDULES_HOTEL_FIELD
AIRTABLE_STEADY_SCHEDULES_MONTH_FIELD
AIRTABLE_STEADY_SCHEDULES_YEAR_FIELD
AIRTABLE_STEADY_SCHEDULES_STATUS_FIELD
AIRTABLE_STEADY_SCHEDULES_MONTH_START_FIELD
AIRTABLE_STEADY_SCHEDULES_VALIDATED_STATUS
AIRTABLE_AUTH_BASE_ID
AIRTABLE_AUTH_TOKENS_TABLE_ID
AIRTABLE_AUTH_TOKEN_FIELD
AIRTABLE_AUTH_EMAIL_FIELD
AIRTABLE_AUTH_EXPIRES_AT_FIELD
AIRTABLE_AUTH_USED_AT_FIELD
AIRTABLE_AUTH_CREATED_AT_FIELD
AIRTABLE_AUTH_USER_AGENT_FIELD
AIRTABLE_AUTH_IP_ADDRESS_FIELD
AIRTABLE_AUTH_STATUS_FIELD
AIRTABLE_AUTH_CONTACT_NAME_FIELD
AIRTABLE_AUTH_HOTEL_NAME_FIELD
AIRTABLE_AUTH_CONTACT_RECORD_ID_FIELD
AIRTABLE_AUTH_HOTEL_RECORD_ID_FIELD
AIRTABLE_AUTH_ACTIVE_STATUS
AIRTABLE_AUTH_USED_STATUS
AIRTABLE_AUTH_EXPIRED_STATUS
RESEND_API_KEY
RESEND_FROM_EMAIL
PORTAL_EMAIL_FROM_NAME
PORTAL_APP_URL
PORTAL_SESSION_SECRET
```

Many auth field variables have defaults in code, but adding them in Vercel can make the configuration easier to audit.

## Local Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

Run production build:

```bash
npm run build
```

## Deployment

Vercel is connected to GitHub. Pushing to `main` triggers a production deployment.

Standard process:

```bash
git status
npm run build
git add <changed-files>
git commit -m "Describe the change"
git push origin main
```

After push, check Vercel deployment logs if anything fails.

## Pre-Deploy Checklist

- `npm run build` passes.
- `.env.local` is not staged.
- No screenshots or local-only files are staged accidentally.
- Vercel environment variables are up to date.
- Sign-in works locally.
- Home page loads for a test client.
- Calendar loads for a test client.
- Booking detail modal opens.
- Calendar export downloads and imports correctly.
- Profile page shows the correct contact/property/account manager.

## Data Safety Rules

The portal should be read-only against the production Booking Operations base.

Allowed writes:

- Creating/updating token records in the separate Client Portal Sign In Tokens base/table.

Do not add code that writes to the production Booking Operations base unless MHW explicitly approves it.

## Troubleshooting

### Sign-in email not received

- Confirm `RESEND_API_KEY`.
- Confirm `RESEND_FROM_EMAIL`.
- Check Resend logs.
- Check spam/junk.
- Confirm the email exists in Hotel Contacts.
- Confirm the contact has portal access.

### Magic link opens the wrong site

- Check `PORTAL_APP_URL`.
- Confirm the value is the deployed Vercel URL or custom production domain.
- Re-request a new sign-in link after changing the URL.

### Magic link says used or expired

- Request a new link.
- Check token status in the auth token table.
- Confirm the token was not opened by an email scanner before the user clicked continue.

### Calendar shows no bookings

- Confirm the signed-in contact is linked to the correct hotel.
- Confirm the Gigs records contain that hotel in `Hotels (from Gig Codes)`.
- Confirm `Date` is populated.
- Confirm records are not excluded by `Last Minute Cancellation`.
- Confirm the visible calendar month/date range actually contains records.

### Times look wrong

- Confirm the hotel's `Timezone` field is populated.
- Confirm the portal displays the correct timezone label.
- Test the downloaded calendar event in a calendar app.
- Remember: imported calendar events may display in the user's local device timezone while still representing the correct instant.

### Holiday coverage looks wrong

- Check Holiday-Hotel records for the property.
- Confirm the `2026 Date` field is populated.
- Confirm linked `Gigs` records are correct.

### Schedule progress looks wrong

- Check Steady Schedules by Month for the property.
- Confirm `Month`, `Year`, `Status`, and `Schedule Month Start Date` are populated.
- Confirm `Status` matches `Schedule Validated` exactly.

### Deployment fails

- Open Vercel deployment logs.
- Confirm all required environment variables exist.
- Run `npm run build` locally.
- Fix TypeScript/build errors before pushing again.
