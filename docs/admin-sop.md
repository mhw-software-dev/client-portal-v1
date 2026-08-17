# MHW Client Portal Admin SOP

## Purpose

Use this SOP to manage who can access the MHW Client Portal and what schedule information hotel clients see.

## Primary Systems

- Airtable: source of client contacts, hotels, gigs, holiday coverage, and schedule validation.
- Resend: sends secure sign-in links.
- Vercel: hosts the portal.
- GitHub: stores the portal codebase.

## Access Rules

A hotel contact can access the portal when they exist in the Hotel Contacts table and meet at least one of these conditions:

- `Point of Contact Type` contains `Key Stakeholder`
- `Enable Client Portal` is checked

The contact must also have a valid email address.

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
- Full calendar by month, week, and list
- Booking details
- Performer details
- Holiday coverage
- Schedule validation
- Open schedule days
- Client profile/contact information

## Key Airtable Data Sources

- Hotel Contacts: controls portal access.
- Hotels: property information, timezone, and account manager details.
- Gigs: client-facing entertainment schedule.
- Holiday-Hotel: holiday coverage per property.
- Steady Schedules by Month: schedule validation status.
- Client Portal Sign In Tokens: secure sign-in token records.

## Important Notes

- Do not delete client contacts just to remove portal access.
- The portal should remain read-only for clients.
- If a client cannot sign in, first confirm their email exists in Hotel Contacts and meets the access rules above.
- If a client sees the wrong property, check the Hotel Contacts to Hotels relationship.

