# Business Partner Onboarding

## Overview
This module lets potential partner car owners submit their details and at least 1 car photo for review. After approval, the platform admin manually creates the actual car listing in the existing admin “Car Fleet” flow.

## User Flow (Public)
- Page: `/start-business`
- Steps:
  - Contact: owner name + contact number (required); email + business name (optional)
  - Car: optional car make/model/year + required car photo uploads (min 1, max 6) + notes
  - Review: confirm and submit
- Submission endpoint: `POST /api/business-applications` (multipart form data)
- After submit: user sees a reference ID and “Pending review” message

## Admin Flow
- Admin page: `/admin/business-applications` (label: Business Leads)
- Admin actions:
  - View application details + photos
  - Approve / Reject
  - Add internal admin notes
- Admin endpoints:
  - `GET /api/admin/business-applications?status=pending|approved|rejected&limit=...`
  - `GET /api/admin/business-applications/:id`
  - `PUT /api/admin/business-applications/:id` body: `{ status, adminNotes }`

## Data Model (Supabase)
Migration: `supabase/migrations/014_business_applications.sql`

- `business_applications`
  - `owner_name`, `contact_number` required
  - `status`: `pending|approved|rejected`
- `business_application_images`
  - Stores processed image paths/URLs for each application

RLS is enabled and no public policies are added. Writes/reads occur via server routes using the Service Role key.

## Storage
The submission endpoint uploads images to a Supabase Storage bucket:
- Default bucket name: `business-applications`
- Override with env: `SUPABASE_BUSINESS_APPLICATIONS_BUCKET`

Images are processed into:
- original + medium.webp + thumb.webp

## Validation Rules
Public submission (server-side):
- Required: `ownerName`, `contactNumber`, at least 1 file
- Files: image/* only, max 6
- Car year: optional, must be 1900–2100 if present

## Operational Notes
- Approval does not auto-publish cars. Admin must manually create/attach cars after approval.
- For production, ensure the DB migration is applied and the storage bucket exists.

