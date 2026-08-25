# MHW Client Portal Admin SOP

## Purpose

Use this SOP to manage who can access the MHW Client Portal and what schedule information hotel clients see.

## Primary Systems

- Airtable: source of client contacts, hotels, gigs, holiday coverage, and schedule progress.
- Resend: sends secure sign-in links.
- Vercel: hosts the portal.
- GitHub: stores the portal codebase.

## Access Rules

A hotel contact can access the portal when they exist in the Hotel Contacts table and meet at least one of these conditions:

- `Point of Contact Type` contains `Key Stakeholder`
- `Enable Client Portal` is checked

The contact must also have a valid email address.

## Sign-In Link And Session Timing

- Secure sign-in links expire after 30 minutes.
- Each sign-in link can only be completed once.
- After a user signs in, the session cookie remains active for 12 hours.
- Closing the browser does not require a new sign-in link if the session cookie is still available and unexpired.
- Logging out clears the session, so the user must request a new sign-in link.

## Add A New Client Contact

1. Open the Hotel Contacts table in Airtable.
2. Add or confirm the contact's name and email address.
3. Link the contact to the correct hotel/property.
4. Mark the contact as a `Key Stakeholder` or check `Enable Client Portal`.
5. Ask the contact to use the portal sign-in page and request a secure link.

## Remove Client Portal Access

1. Open the Hotel Contacts table.
2. Find the contact.
3. Remove `Key Stakeholder` from `Point of Contact Type` and uncheck `Enable Client Portal`.
4. Keep the record if the contact still needs to remain in Airtable for historical/reference purposes.

## What Clients See

Clients only see booking data connected to their property. The portal currently shows:

- This week's entertainment
- Full calendar with month/week range options and calendar/list format options
- Calendar summary for bookings added during the current week
- Booking details
- Performer feedback submission from booking details for booking dates that have arrived
- Performer details
- Holiday coverage
- Schedule progress
- This month and next month's entertainment
- Client profile/contact information

## Key Airtable Data Sources

- Hotel Contacts: controls portal access.
- Hotels: property information, timezone, and account manager details.
- Gigs: client-facing entertainment schedule.
- Gigs feedback fields: store performer rating, hotel feedback notes, and the signed-in client contact name.
- Gigs `Created` field: powers the calendar's added-this-week summary.
- Holiday-Hotel: holiday coverage per property.
- Steady Schedules by Month: schedule progress status.
- Client Portal Sign In Tokens: secure sign-in token records.

## Important Notes

- Do not delete client contacts just to remove portal access.
- The portal should remain read-only for clients.
- The approved exception is performer feedback from a booking detail page, which writes feedback fields back to the related Gigs record.
- Artist feedback is available only on or after the booking date and is blocked for future gigs.
- If a client cannot sign in, first confirm their email exists in Hotel Contacts and meets the access rules above.
- If a client sees the wrong property, check the Hotel Contacts to Hotels relationship.
