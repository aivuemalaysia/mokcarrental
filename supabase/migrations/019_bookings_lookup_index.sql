-- Fast customer history lookup by WhatsApp number
-- Supports the /my-bookings "rebook in one tap" flow: the lookup API
-- (src/app/api/bookings/route.ts) keys a customer's past inquiries by
-- whatsapp_number, so this index keeps that query cheap as volume grows.
CREATE INDEX IF NOT EXISTS idx_inquiries_whatsapp_number ON inquiries (whatsapp_number);
