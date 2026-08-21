# MHW Client Portal

Custom Client Portal proof of concept for MHW Live Music.

This project is intentionally separate from the Performer Portal. Keep code, environment variables, Vercel settings, and Airtable configuration isolated so changes here do not affect performer-facing workflows.

## Current Status

Status: active Client Portal proof of concept with session-based magic-link authentication.

Built so far:
- Separate Git repo: `mhw-software-dev/client-portal-v1`
- Branded MHW Client Portal shell, nav, footer, Home, Calendar, and Profile pages
- Airtable read-only schedule, profile, holiday coverage, and schedule progress data
- Separate Airtable auth/token base for magic-link sign-in records
- Resend-powered magic-link email delivery
- Signed session cookie authentication
- Protected Home, Calendar, and Profile pages
- Logout route and account menu
- Client-safe loading, empty, and sign-in error states

## Local Development

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:3000
```

If another app is already using port `3000`, Next.js may use `3001` or another available port.

## Environment Variables

Copy `.env.example` into `.env.local`, then fill in local values.

```bash
cp .env.example .env.local
```

Required for Airtable and auth connection:

| Variable | Purpose |
| --- | --- |
| `AIRTABLE_PAT` | Airtable personal access token used by server-side API calls |
| `AIRTABLE_CLIENT_PORTAL_BASE_ID` | Booking Operations base used as the read-only client data source |
| `AIRTABLE_CLIENTS_TABLE_ID` | Hotels/client table ID |
| `AIRTABLE_GIGS_TABLE_ID` | Gigs/schedule table ID |
| `AIRTABLE_HOTEL_CONTACTS_TABLE_ID` | Hotel Contacts table ID used to authorize portal access |
| `AIRTABLE_AUTH_BASE_ID` | Separate auth/token base ID |
| `AIRTABLE_AUTH_TOKENS_TABLE_ID` | Sign-in token table ID in the auth/token base |
| `AIRTABLE_HOTEL_CONTACTS_TYPE_ALLOWED` | Multi-select option that grants portal access, currently `Key Stakeholder` |
| `PORTAL_APP_URL` | Local or deployed app URL used when generating magic links |
| `PORTAL_SESSION_SECRET` | Long random secret used for signed session cookies |
| `RESEND_API_KEY` | Resend API key for magic-link email delivery |
| `RESEND_FROM_EMAIL` | Sender email. Local testing can use `onboarding@resend.dev`; production should use a verified MHW domain. |
| `PORTAL_EMAIL_FROM_NAME` | Sender display name for portal emails |

`AIRTABLE_CLIENT_PORTAL_TEST_EMAIL` is deprecated for real portal pages. Home, Calendar, and Profile use the signed-in session email.

Do not commit `.env.local` or real credentials.

## Airtable Health Check

After `.env.local` is configured and the dev server is running, open:

```text
/api/health/airtable
```

Expected result when configured:

```json
{
  "status": "connected",
  "configured": true,
  "message": "Airtable client source is reachable."
}
```

## Recommended Next Steps

1. Define the Client Portal user and use case.
   - Who logs in: hotel contact, client admin, accounting contact, or all client contacts?
   - What should they see first?

2. Confirm Airtable source.
   - Base ID
   - Clients/hotels table ID
   - Gigs/schedules table ID
   - Active client view ID
   - Client email/contact field

3. Build the branded shell.
   - MHW navbar
   - MHW footer
   - Dashboard layout
   - Responsive styling

4. Build first client-facing pages.
   - Home/dashboard
   - Calendar/schedule
   - Current bookings
   - Profile/account details

5. Continue auth hardening.
   - Test valid, expired, used, and unauthorized sign-in links.
   - Verify Resend domain before production email delivery.
   - Add any admin/support workflow MHW wants for granting access.

## Notes

This project should not import or reuse files directly from the Performer Portal unless intentionally copied and adapted. Shared patterns are okay; shared runtime dependencies between repos are not needed right now.
