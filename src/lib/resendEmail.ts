type SendResendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function safeText(text: unknown) {
  return escapeHtml(typeof text === 'string' ? text : '');
}

export async function sendResendEmail(args: SendResendEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey) return { ok: false as const, error: 'Missing RESEND_API_KEY' };
  if (!from) return { ok: false as const, error: 'Missing RESEND_FROM_EMAIL' };

  const payload: Record<string, unknown> = {
    from,
    to: [args.to],
    subject: args.subject,
    html: args.html,
  };

  if (args.replyTo) payload.reply_to = args.replyTo;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      typeof (json as any)?.message === 'string'
        ? (json as any).message
        : typeof (json as any)?.error === 'string'
          ? (json as any).error
          : `Resend request failed (${res.status})`;
    return { ok: false as const, error: message };
  }

  return { ok: true as const, data: json };
}

