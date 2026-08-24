import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jsonError, jsonOk } from '@/lib/apiResponse';
import { safeText, sendResendEmail } from '@/lib/resendEmail';
import { rateLimit } from '@/lib/rateLimit';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^\+?[0-9\s\-()]{6,20}$/.test(phone.trim());
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const limited = await rateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 60_000 });
    if (!limited.ok) return jsonError('Too many requests. Please try again later.', 429);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return jsonError('Invalid request body', 400);

    // Honeypot: bots fill "website", humans don't see it
    const honeypot = (body as any).website;
    if (honeypot) {
      console.info('CONTACT_HONEYPOT_HIT', { ip });
      return jsonOk({ ok: true });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name) return jsonError('Name is required', 400);
    if (!email) return jsonError('Email is required', 400);
    if (!phone) return jsonError('Phone is required', 400);
    if (!isValidEmail(email)) return jsonError('Invalid email address', 400);
    if (!isValidPhone(phone)) return jsonError('Invalid phone number', 400);
    if (name.length > 120) return jsonError('Name is too long', 400);
    if (phone.length > 40) return jsonError('Phone number is too long', 400);
    if (message.length > 2000) return jsonError('Message is too long', 400);

    const client = getAdminClient();
    if (!client) return jsonError('Server misconfigured', 500);

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const { data, error } = await (client.from('inquiries') as any).insert([{
      car_id: 'general',
      car_name: 'General Inquiry',
      customer_name: name,
      whatsapp_number: phone,
      email,
      pickup_date: today,
      return_date: today,
      pickup_location: 'General Inquiry',
      notes: message || null,
      status: 'pending' as const,
    }]).select('*').single();

    if (error) {
      console.error('CONTACT_DB_ERROR:', error);
      return jsonError('Failed to save your inquiry. Please try again or contact us via WhatsApp.', 500);
    }

    const inquiryId = (data as any)?.id || null;

    // Fire-and-forget email notification
    const sendEmailPromise = (async () => {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@mokcarrental.com';
        const toEmail = process.env.ADMIN_CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL;
        if (toEmail) {
          const html = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
              <h2 style="color:#b8860b;">New General Inquiry from ${safeText(name)}</h2>
              <table style="border-collapse:collapse;">
                <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:bold;">Email</td>
                    <td style="padding:8px 12px;border-bottom:1px solid #eee;">${safeText(email)}</td></tr>
                <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:bold;">Phone</td>
                    <td style="padding:8px 12px;border-bottom:1px solid #eee;">${safeText(phone)}</td></tr>
                <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:bold;">Message</td>
                    <td style="padding:8px 12px;border-bottom:1px solid #eee;">${safeText(message)}</td></tr>
              </table>
              <p style="margin-top:20px;color:#666;">Received from contact page on Mok Car Rental website.</p>
            </div>
          `;
          const result = await sendResendEmail({
            to: toEmail,
            subject: `[MOK Car] New Inquiry from ${safeText(name)}`,
            html,
            replyTo: email,
          });
          if (!result.ok) {
            console.warn('CONTACT_EMAIL_FAILED:', result.error);
          } else {
            console.info('CONTACT_EMAIL_SENT', { inquiryId, to: toEmail });
          }
        }
      } catch (emailErr) {
        console.warn('CONTACT_EMAIL_ERROR:', emailErr);
      }
    })();

    // Log the event
    const eventInsert = (client.from('inquiries_events') as any)
      .insert([{ event_type: 'inquiry_created', inquiry_id: inquiryId }])
      .select('id').single();

    await Promise.allSettled([sendEmailPromise, eventInsert]);

    return jsonOk({ ok: true, inquiryId }, { status: 201 });
  } catch (err) {
    console.error('CONTACT_ROUTE_ERROR:', err);
    return jsonError('Internal server error', 500);
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
}