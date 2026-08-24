# MHW Portal Build Template

## Purpose

Use this template as the starting blueprint for future MHW portal builds. It captures the patterns, styling decisions, setup checklist, and launch expectations from the MHW Client Portal so the next portal can start from a familiar structure instead of from scratch.

This is not a separate starter repo. It is an internal reference document for planning and implementation.

## Portal Principles

- Build the real portal experience first, not a marketing landing page.
- Keep the interface premium, calm, and client-safe.
- Use MHW navy, green, gold, white, and light gray as the core palette.
- Avoid exposing internal system names or backend tool names to end users.
- Keep source data read-only unless a write flow is explicitly approved.
- Use clear empty states instead of showing broken or internal-looking data.
- Prefer practical dashboard summaries over decorative content.

## Recommended App Structure

Core routes:

- `/sign-in`: magic-link sign-in page.
- `/auth/callback`: verifies magic links and completes session creation.
- `/`: dashboard/home page.
- `/calendar` or equivalent main workflow page.
- `/profile`: signed-in contact/property profile.
- API routes for auth, portal data, support requests, and health checks.

Recommended source layout:

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: shared UI components.
- `src/lib`: auth, data fetching, formatting, and integration helpers.
- `docs`: client SOP, admin SOP, technical SOP, and portal-specific build notes.

## Brand And UI Rules

Theme tokens should live in global CSS:

- Navy: primary interface color.
- Green: primary action, progress, and success color.
- Gold: labels, highlights, and section accents.
- White/light gray: page backgrounds, cards, and panels.

UI guidance:

- Use subtle rounding, restrained shadows, and generous spacing.
- Keep cards at practical sizes; avoid nested cards.
- Use compact dashboard cards for operational summaries.
- Use modals for details, not for every high-level KPI.
- Use a thin top loading/progress bar for route and data loading.
- Place floating support/help UI away from status toasts.
- Make responsive layouts work across desktop, tablet, and mobile.

## Core Components To Reuse Conceptually

- Portal shell with MHW header, nav, account menu, and footer.
- Magic-link sign-in form with client-safe success/error messages.
- Dashboard hero with property context and high-level KPIs.
- Calendar controls split into Range and Format.
- Booking/detail modal pattern with client-facing fields only.
- Profile card with contact, property, and account manager details.
- Floating Need Help widget or equivalent support request flow.
- Loading toast and top route progress bar.
- Empty, error, and unauthorized states.

## Authentication Pattern

Recommended auth approach:

- Use magic links instead of client-managed passwords.
- Store sign-in tokens in a separate auth/support base or table.
- Use signed HTTP-only session cookies.
- Keep token statuses such as Active, Used, and Expired.
- Redirect unauthenticated first-time visitors to a clean sign-in page.
- Only show expiration messages when the user is using an expired or invalid link/session.

Access rules should be explicit and documented per portal. For this portal, access is based on approved Hotel Contacts.

## Data Integration Pattern

Use Airtable or the chosen source system as the source of truth, but keep client-facing language generic.

Data fetching rules:

- Fetch only the records needed for the visible page or date range.
- Normalize source records into client-safe objects before sending them to the frontend.
- Filter out canceled, internal, or excluded records server-side.
- Use environment variables for table IDs and configurable field names.
- Do not hardcode secrets or source credentials.
- Do not show backend/system names to clients.

When adding dashboard summaries, prefer objective data points:

- Counts for current/next period.
- Confirmed planning progress.
- Recently added records using created timestamps.
- Latest added date.
- Coverage status for holidays or other fixed categories.

Avoid vague update/audit summaries unless the portal can answer the follow-up question.

## Environment Checklist

Every new portal should document required variables in `.env.example`.

Typical categories:

- Source data API key/token.
- Source data base/table IDs.
- Configurable field names.
- Auth token base/table IDs.
- Support request table IDs.
- Email provider API key.
- Sender email/name.
- Public portal URL.
- Session secret.
- Local test bypass values, if needed.

Rules:

- Never commit `.env.local`.
- Keep production env vars in Vercel.
- Update `PORTAL_APP_URL` after the custom domain is ready.
- Use verified email sender domains before launch.

## Vercel And Domain Checklist

- Create/connect the Vercel project.
- Confirm the GitHub repo and production branch.
- Add all required environment variables.
- Add the custom domain.
- Verify DNS.
- Redeploy after domain/env changes.
- Test the deployed custom domain, not only the Vercel preview URL.

## Resend Or Email Checklist

- Add and verify the sending domain.
- Confirm DKIM, SPF, and MX records exactly match provider instructions.
- Use a branded sender, such as `MHW Client Portal <portal@mail.mhwlivemusic.com>`.
- Send test magic links to real inboxes.
- Check spam/junk behavior.
- Confirm links use the custom portal domain.

## Launch QA Checklist

Before launch:

- `npm run build` passes.
- Remote repo is verified before pushing.
- `.env.local` and secrets are not staged.
- Sign-in works with a real approved contact.
- Expired, used, invalid, and unauthorized links show safe messages.
- Dashboard loads for the correct property.
- Calendar/list views load correctly.
- Detail modals show client-safe data.
- Profile shows correct contact/property/account manager information.
- Support/help request flow works if enabled.
- No backend tool names or internal-only terms appear in the UI.
- Mobile and tablet layouts are checked.
- SOPs are updated.

## Documentation Checklist

Each portal should include:

- Client/user SOP.
- Admin SOP.
- Technical maintenance SOP.
- Environment variable reference.
- Launch checklist.
- Known limitations or follow-up items.

Update docs whenever a client-facing workflow changes.

## Safety Rules

- Do not modify production source data unless explicitly approved.
- Keep portal repos isolated from other MHW/client repos.
- Verify the Git remote before committing and pushing.
- Do not commit secrets, screenshots with sensitive data, or local build output.
- Keep personal backup remotes separate and remove them after one-time use if needed.

## First Build Sequence

1. Define the portal audience and access rule.
2. Confirm source data tables, fields, and relationships.
3. Create the branded shell and sign-in flow.
4. Build the primary dashboard.
5. Build the main workflow page, such as a calendar, roster, report, or request center.
6. Add profile/account context.
7. Add support/help flow if needed.
8. Add client-safe loading, empty, and error states.
9. Write SOPs.
10. Configure Vercel, custom domain, and email sender.
11. Run live QA with real approved users.
