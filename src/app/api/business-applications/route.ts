import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';
import { getFileExtFromContentType, processCarImage } from '@/lib/carImages';
import { safeText, sendResendEmail } from '@/lib/resendEmail';

const DEFAULT_BUCKET = 'business-applications';

async function resolveBucketName(client: NonNullable<ReturnType<typeof getSupabaseAdminClient>>) {
  const explicit = process.env.SUPABASE_BUSINESS_APPLICATIONS_BUCKET;
  if (explicit) return explicit;

  const { data, error } = await client.storage.listBuckets();
  if (error) return DEFAULT_BUCKET;

  const names = new Set((data || []).map((b) => b.name));
  if (names.has(DEFAULT_BUCKET)) return DEFAULT_BUCKET;
  return DEFAULT_BUCKET;
}

function normalizeStorageBucketError(message: string, bucketName: string) {
  if (message.toLowerCase().includes('bucket not found')) {
    return `Storage bucket not found: "${bucketName}". Create it in Supabase Storage or set SUPABASE_BUSINESS_APPLICATIONS_BUCKET.`;
  }
  return message;
}

function normalizeSchemaCacheError(message: string) {
  if (message.includes("Could not find the table 'public.business_applications' in the schema cache")) {
    return "Database table 'business_applications' is missing (or PostgREST schema cache is stale). Apply migration 014_business_applications.sql then run NOTIFY pgrst, 'reload schema'.";
  }
  if (message.includes("Could not find the table 'public.business_application_images' in the schema cache")) {
    return "Database table 'business_application_images' is missing (or PostgREST schema cache is stale). Apply migration 014_business_applications.sql then run NOTIFY pgrst, 'reload schema'.";
  }
  return message;
}

function normalizeText(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(request: Request) {
  const client = getSupabaseAdminClient();
  if (!client) return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });

  try {
    const form = await request.formData().catch(() => null);
    if (!form) return NextResponse.json({ ok: false, error: 'Invalid form data' }, { status: 400 });

    const ownerName = normalizeText(form.get('ownerName'));
    const contactNumber = normalizeText(form.get('contactNumber'));
    const email = normalizeText(form.get('email'));
    const businessName = normalizeText(form.get('businessName'));
    const carMake = normalizeText(form.get('carMake'));
    const carModel = normalizeText(form.get('carModel'));
    const carYearRaw = normalizeText(form.get('carYear'));
    const notes = normalizeText(form.get('notes'));

    const carYear = carYearRaw ? Number(carYearRaw) : null;

    if (!ownerName) return NextResponse.json({ ok: false, error: 'Owner name is required.' }, { status: 400 });
    if (!contactNumber) return NextResponse.json({ ok: false, error: 'Contact number is required.' }, { status: 400 });

    // SECURITY FIX: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ ok: false, error: 'Invalid email format.' }, { status: 400 });
    }

    // SECURITY FIX: Validate phone number format (basic international format)
    const phoneClean = contactNumber.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(phoneClean)) {
      return NextResponse.json({ ok: false, error: 'Invalid phone number format.' }, { status: 400 });
    }

    const files = form.getAll('files').filter(Boolean) as File[];
    if (!files.length) return NextResponse.json({ ok: false, error: 'At least 1 car photo is required.' }, { status: 400 });
    if (files.length > 6) return NextResponse.json({ ok: false, error: 'Too many files (max 6).' }, { status: 400 });

    if (ownerName.length > 120) return NextResponse.json({ ok: false, error: 'Owner name is too long.' }, { status: 400 });
    if (contactNumber.length > 60) return NextResponse.json({ ok: false, error: 'Contact number is too long.' }, { status: 400 });
    if (email.length > 160) return NextResponse.json({ ok: false, error: 'Email is too long.' }, { status: 400 });
    if (businessName.length > 160) return NextResponse.json({ ok: false, error: 'Business name is too long.' }, { status: 400 });
    if (carMake.length > 80) return NextResponse.json({ ok: false, error: 'Car make is too long.' }, { status: 400 });
    if (carModel.length > 120) return NextResponse.json({ ok: false, error: 'Car model is too long.' }, { status: 400 });
    if (notes.length > 1000) return NextResponse.json({ ok: false, error: 'Notes is too long.' }, { status: 400 });
    if (carYear !== null && (!Number.isFinite(carYear) || carYear < 1900 || carYear > 2100)) {
      return NextResponse.json({ ok: false, error: 'Car year is invalid.' }, { status: 400 });
    }

    const { data: appRow, error: appError } = await client
      .from('business_applications')
      .insert({
        owner_name: ownerName,
        contact_number: contactNumber,
        email: email || null,
        business_name: businessName || null,
        car_make: carMake || null,
        car_model: carModel || null,
        car_year: carYear,
        notes: notes || null,
        status: 'pending',
      })
      .select('*')
      .single();

    if (appError) {
      return NextResponse.json({ ok: false, error: normalizeSchemaCacheError(appError.message || 'Failed to submit') }, { status: 500 });
    }

    const bucketName = await resolveBucketName(client);
    const insertedImages: any[] = [];

    for (let idx = 0; idx < files.length; idx += 1) {
      const file = files[idx];
      if (!file || typeof (file as any).arrayBuffer !== 'function') {
        return NextResponse.json({ ok: false, error: 'Invalid file' }, { status: 400 });
      }

      const contentType = file.type || '';
      if (!contentType.startsWith('image/')) {
        return NextResponse.json({ ok: false, error: 'Only image files are allowed.' }, { status: 400 });
      }

      const buf = Buffer.from(await file.arrayBuffer());
      const processed = await processCarImage(buf, contentType);
      const ext = getFileExtFromContentType(processed.original.contentType);

      const imageId = randomUUID();
      const basePath = `applications/${appRow.id}/${imageId}`;

      const originalPath = `${basePath}/original.${ext}`;
      const mediumPath = `${basePath}/medium.webp`;
      const thumbPath = `${basePath}/thumb.webp`;

      const cleanupPaths: string[] = [];

      const originalUpload = await client.storage.from(bucketName).upload(originalPath, processed.original.buffer, {
        contentType: processed.original.contentType,
        upsert: false,
      });
      if (originalUpload.error) throw new Error(normalizeStorageBucketError(originalUpload.error.message, bucketName));
      cleanupPaths.push(originalPath);

      const mediumUpload = await client.storage.from(bucketName).upload(mediumPath, processed.medium.buffer, {
        contentType: processed.medium.contentType,
        upsert: false,
      });
      if (mediumUpload.error) throw new Error(normalizeStorageBucketError(mediumUpload.error.message, bucketName));
      cleanupPaths.push(mediumPath);

      const thumbUpload = await client.storage.from(bucketName).upload(thumbPath, processed.thumb.buffer, {
        contentType: processed.thumb.contentType,
        upsert: false,
      });
      if (thumbUpload.error) throw new Error(normalizeStorageBucketError(thumbUpload.error.message, bucketName));
      cleanupPaths.push(thumbPath);

      const originalUrl = client.storage.from(bucketName).getPublicUrl(originalPath).data.publicUrl;
      const mediumUrl = client.storage.from(bucketName).getPublicUrl(mediumPath).data.publicUrl;
      const thumbUrl = client.storage.from(bucketName).getPublicUrl(thumbPath).data.publicUrl;

      const payload = {
        application_id: appRow.id,
        sort_order: idx,
        original_path: originalPath,
        medium_path: mediumPath,
        thumb_path: thumbPath,
        original_url: originalUrl,
        medium_url: mediumUrl,
        thumb_url: thumbUrl,
        width: processed.original.width,
        height: processed.original.height,
        bytes: processed.original.bytes,
        content_type: processed.original.contentType,
        sha256: processed.original.sha256,
      };

      const { data: row, error } = await client.from('business_application_images').insert(payload).select('*').single();
      if (error) {
        await client.storage.from(bucketName).remove(cleanupPaths);
        throw new Error(normalizeSchemaCacheError(error.message));
      }
      insertedImages.push(row);
    }

    const notifyTo = process.env.ADMIN_NOTIFY_EMAIL;
    if (notifyTo) {
      const baseUrl = request.headers.get('origin') || request.headers.get('referer') || '';
      const adminUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}/admin/business-applications` : '/admin/business-applications';

      const emailResult = await sendResendEmail({
        to: notifyTo,
        subject: `New Business Lead: ${ownerName} (${contactNumber})`,
        replyTo: email || undefined,
        html: `<div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
  <h2 style="margin:0 0 12px;">New Business Lead Submitted</h2>
  <div style="margin:0 0 12px;">
    <div><strong>Owner:</strong> ${safeText(ownerName)}</div>
    <div><strong>Contact:</strong> ${safeText(contactNumber)}</div>
    <div><strong>Email:</strong> ${safeText(email || '-')}</div>
    <div><strong>Business:</strong> ${safeText(businessName || '-')}</div>
    <div><strong>Car:</strong> ${safeText([carMake, carModel].filter(Boolean).join(' ') || '-')}</div>
    <div><strong>Year:</strong> ${safeText(carYearRaw || '-')}</div>
  </div>
  <div style="margin:0 0 12px;">
    <strong>Notes</strong>
    <pre style="white-space:pre-wrap;margin:8px 0 0;padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">${safeText(notes || '-')}</pre>
  </div>
  <div><strong>Application ID:</strong> <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;">${safeText(
    appRow.id
  )}</span></div>
  <div style="margin-top:12px;">
    <a href="${safeText(adminUrl)}">Open admin Business Leads</a>
  </div>
</div>`,
      });

      if (!emailResult.ok) {
        console.error('IK: business application email notify failed', emailResult.error);
      } else {
        console.info('IK: business application email notified', { id: appRow.id });
      }
    }

    console.info('IK: business application submitted', { id: appRow.id, images: insertedImages.length });
    return NextResponse.json({ ok: true, data: { id: appRow.id, status: appRow.status } }, { status: 201 });
  } catch (e: any) {
    const message = typeof e?.message === 'string' ? normalizeSchemaCacheError(e.message) : 'Submission failed';
    console.error('IK: business application submit error', e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

