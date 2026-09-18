# Changelog

## Unreleased

- Car listings: minimum required images reduced to 3 (frontend + admin finalize validation).
- Homepage: featured car listings appear higher on the page and are ordered by most recently updated.
- Booking/Inquiry: pickup location options are now managed from Admin → Content (instead of hardcoded).
- Inquiries admin: added stats endpoint + UI polling fallback so inquiry list and status updates keep working even if realtime events stop.
- Admin Settings: moved business/contact/social/map settings to server-backed storage (content_sections key site_settings) so changes apply across admin sessions.
- Partner onboarding: added public “Start Business” multi-step submission + admin review page (Business Leads). Admin still manually creates car listings after approval.

