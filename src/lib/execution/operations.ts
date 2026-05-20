import sanitizeHtml from 'sanitize-html';
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin';

type IconKey = 'dollar' | 'smile' | 'truck' | 'headphones' | 'award' | 'check';

type WhyChooseItem = {
  icon: IconKey;
  title: string;
  description: string;
};

function isIconKey(v: unknown): v is IconKey {
  return typeof v === 'string' && ['dollar', 'smile', 'truck', 'headphones', 'award', 'check'].includes(v);
}

function buildHtmlFromItems(items: WhyChooseItem[]) {
  const rows = items
    .map((i) => {
      const safeTitle = sanitizeHtml(i.title, { allowedTags: [], allowedAttributes: {} });
      const safeDesc = sanitizeHtml(i.description, { allowedTags: [], allowedAttributes: {} });
      return `<li><strong>${safeTitle}</strong> ${safeDesc}</li>`;
    })
    .join('');
  return `<ul>${rows}</ul>`;
}

export type ExecutionContext = {
  userId: string;
  userEmail: string;
  role: string;
  request: Request;
};

export type ExecutionResult = {
  data: any;
  rollback?: () => Promise<void>;
};

export type ExecutionOperation = {
  name: string;
  allowedRoles: string[];
  validate: (input: any) => { ok: true; value: any } | { ok: false; error: string };
  execute: (ctx: ExecutionContext, input: any) => Promise<ExecutionResult>;
};

const opReloadSchema: ExecutionOperation = {
  name: 'supabase.reload_schema_cache',
  allowedRoles: ['admin', 'trae_executor'],
  validate: () => ({ ok: true, value: {} }),
  execute: async () => {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Server misconfigured');
    const { data, error } = await client.rpc('pgrst_reload_schema');
    if (error) throw new Error(error.message);
    return { data: { reloaded: true, result: data } };
  },
};

const opUpdateWhyChooseItem: ExecutionOperation = {
  name: 'content.why_choose.update_item',
  allowedRoles: ['admin', 'editor', 'trae_executor'],
  validate: (input) => {
    const icon = input?.icon;
    const title = typeof input?.title === 'string' ? input.title.trim() : '';
    const description = typeof input?.description === 'string' ? input.description.trim() : '';
    if (!isIconKey(icon)) return { ok: false, error: 'icon must be one of: dollar|smile|truck|headphones|award|check' };
    if (!title) return { ok: false, error: 'title is required' };
    if (!description) return { ok: false, error: 'description is required' };
    if (title.length > 80) return { ok: false, error: 'title too long' };
    if (description.length > 160) return { ok: false, error: 'description too long' };
    return { ok: true, value: { icon, title, description } };
  },
  execute: async (_ctx, input) => {
    const client = getSupabaseAdminClient();
    if (!client) throw new Error('Server misconfigured');

    const { data: existing, error: readErr } = await client
      .from('content_sections')
      .select('key,title,items,content_html,deleted_at')
      .eq('key', 'why_choose_us')
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);

    const prev = existing;
    const items = Array.isArray(existing?.items) ? (existing?.items as any[]) : [];

    const normalized: WhyChooseItem[] = items
      .map((raw) => {
        const icon = raw?.icon;
        if (!isIconKey(icon)) return null;
        const title = typeof raw?.title === 'string' ? raw.title : '';
        const description = typeof raw?.description === 'string' ? raw.description : '';
        return { icon, title, description };
      })
      .filter(Boolean) as WhyChooseItem[];

    const nextItems = normalized.length ? normalized : [];
    const idx = nextItems.findIndex((i) => i.icon === input.icon);
    if (idx >= 0) nextItems[idx] = input;
    else nextItems.push(input);

    if (nextItems.length !== 6) {
      throw new Error(`Expected 6 items after update, got ${nextItems.length}`);
    }

    const content_html = buildHtmlFromItems(nextItems);
    const { data: saved, error: saveErr } = await client
      .from('content_sections')
      .upsert(
        {
          key: 'why_choose_us',
          title: existing?.title || 'Why Choose Mok Car Rental?',
          items: nextItems,
          content_html,
          deleted_at: null,
          deleted_by_email: null,
        },
        { onConflict: 'key' },
      )
      .select('key,title,items,updated_at')
      .single();
    if (saveErr) throw new Error(saveErr.message);

    return {
      data: saved,
      rollback: prev
        ? async () => {
            await client
              .from('content_sections')
              .upsert(
                {
                  key: prev.key,
                  title: prev.title,
                  items: prev.items || [],
                  content_html: prev.content_html,
                  deleted_at: prev.deleted_at ?? null,
                },
                { onConflict: 'key' },
              );
          }
        : undefined,
    };
  },
};

export const executionOperations: Record<string, ExecutionOperation> = {
  [opReloadSchema.name]: opReloadSchema,
  [opUpdateWhyChooseItem.name]: opUpdateWhyChooseItem,
};

