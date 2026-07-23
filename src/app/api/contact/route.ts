import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jsonError, jsonOk } from '@/lib/apiResponse';
import { safeText, sendResendEmail } from '@/lib/resendEmail';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.name || !body.email || !body.phone) {
      return jsonError('Name, email, and phone are required', 400);
    }

    const { name, email, phone, message } = body;

    // Store via Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const client = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
      
      // Insert into inquiries table as a "general inquiry" record
      const { error } = await (client as any).from('inquiries').insert([{
        car_id: 'general',
        car_name: 'General Inquiry',
        customer_name: name.trim(),
        whatsapp_number: phone.trim(),
        email: email.trim(),
        pickup_date: new Date().toISOString().split('T')[0],
        return_date: new Date().toISOString().split('T')[0],
        pickup_location: 'General Inquiry',
        notes: message?.trim() || null,
        status: 'pending' as const,
      }]);

      if (error) {
        console.error('Contact inquiry DB insert error:', error);
      }
    }

    // Send email notification to admin
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
          console.warn('Email notification failed:', result.error);
        }
      }
    } catch (emailErr) {
      console.warn('Contact email notification error:', emailErr);
    }

    return jsonOk({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('Contact route error:', err);
    return jsonError('Internal server error', 500);
  }
}
