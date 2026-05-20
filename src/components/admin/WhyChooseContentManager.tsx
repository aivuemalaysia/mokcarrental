'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiAward, FiCheck, FiCheckCircle, FiDollarSign, FiEye, FiHeadphones, FiSave, FiSmile, FiTrash2, FiTruck } from 'react-icons/fi';
import ConfirmDialog from '@/components/admin/ConfirmDialog';

type ContentSection = {
  key: string;
  title: string;
  content_html?: string;
  items?: unknown;
  deleted_at?: string | null;
  updated_at?: string | null;
};

type IconKey = 'dollar' | 'smile' | 'truck' | 'headphones' | 'award' | 'check';

type WhyChooseItem = {
  icon: IconKey;
  title: string;
  description: string;
};

const iconMap: Record<IconKey, any> = {
  dollar: FiDollarSign,
  smile: FiSmile,
  truck: FiTruck,
  headphones: FiHeadphones,
  award: FiAward,
  check: FiCheckCircle,
};

const defaultItems: WhyChooseItem[] = [
  {
    icon: 'dollar',
    title: 'Affordable Pricing',
    description: 'Competitive rates without hidden charges. Best value for your money.',
  },
  {
    icon: 'smile',
    title: 'Clean & Sanitized',
    description: 'All cars thoroughly cleaned and sanitized before every rental.',
  },
  {
    icon: 'truck',
    title: 'Airport Delivery',
    description: 'Convenient pickup and drop-off at Senai Airport.',
  },
  {
    icon: 'headphones',
    title: '24/7 Support',
    description: 'Round-the-clock customer support via WhatsApp.',
  },
  {
    icon: 'award',
    title: 'Trusted by Singaporeans',
    description: 'Hundreds of satisfied customers from Singapore.',
  },
  {
    icon: 'check',
    title: 'Easy Booking',
    description: 'Simple WhatsApp booking process. No complicated forms.',
  },
];

function parseItems(input: unknown): WhyChooseItem[] {
  if (!Array.isArray(input)) return [];
  const normalized = input
    .map((raw) => {
      const icon = typeof raw?.icon === 'string' ? raw.icon : '';
      const title = typeof raw?.title === 'string' ? raw.title : '';
      const description = typeof raw?.description === 'string' ? raw.description : '';
      if (!['dollar', 'smile', 'truck', 'headphones', 'award', 'check'].includes(icon)) return null;
      return { icon: icon as IconKey, title, description };
    })
    .filter(Boolean) as WhyChooseItem[];
  return normalized;
}

export default function WhyChooseContentManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [preview, setPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [title, setTitle] = useState('Why Choose Mok Car Rental?');
  const [items, setItems] = useState<WhyChooseItem[]>(defaultItems);
  const [serverContent, setServerContent] = useState<ContentSection | null>(null);

  const adminEmail = useMemo(() => {
    try {
      const raw = localStorage.getItem('adminUser');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return typeof parsed?.email === 'string' ? parsed.email : '';
    } catch {
      return '';
    }
  }, []);

  const load = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/content/why-choose', { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setErrorMessage(json?.error || 'Failed to load content.');
        return;
      }
      const data = json.data as ContentSection | null;
      setServerContent(data);
      if (data?.title) setTitle(data.title);
      const parsed = parseItems(data?.items);
      if (parsed.length) setItems(parsed);
    } catch (e) {
      console.error('IK: Failed to load content', e);
      setErrorMessage('Failed to load content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const validate = () => {
    if (!title.trim()) return 'Title is required.';
    if (title.trim().length > 120) return 'Title is too long.';
    if (!Array.isArray(items) || items.length !== 6) return 'Exactly 6 content items are required.';
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (!item.title.trim()) return `Item ${i + 1}: title is required.`;
      if (!item.description.trim()) return `Item ${i + 1}: description is required.`;
      if (item.title.trim().length > 80) return `Item ${i + 1}: title is too long.`;
      if (item.description.trim().length > 160) return `Item ${i + 1}: description is too long.`;
    }
    return '';
  };

  const handleSave = async () => {
    setMessage('');
    setErrorMessage('');
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    try {
      console.info('IK: Saving why-choose content', { itemsCount: items.length });
      const res = await fetch('/api/admin/content/why-choose', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
        },
        body: JSON.stringify({ title, items }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setErrorMessage(json?.error || 'Failed to save content.');
        return;
      }
      setServerContent(json.data);
      setMessage('Content saved successfully!');
      setTimeout(() => setMessage(''), 2500);
    } catch (e) {
      console.error('IK: Failed to save content', e);
      setErrorMessage('Failed to save content.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setMessage('');
    setErrorMessage('');
    setSaving(true);
    try {
      console.info('IK: Soft deleting why-choose content');
      const res = await fetch('/api/admin/content/why-choose', {
        method: 'DELETE',
        headers: {
          'x-admin-email': adminEmail,
        },
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setErrorMessage(json?.error || 'Failed to delete content.');
        return;
      }
      setServerContent(json.data);
      setItems(defaultItems);
      setMessage('Content deleted (soft delete).');
      setTimeout(() => setMessage(''), 2500);
    } catch (e) {
      console.error('IK: Failed to delete content', e);
      setErrorMessage('Failed to delete content.');
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Content Management</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Edit the &quot;Why Choose Mok Car Rental?&quot; section content
        </p>
      </div>

      {message && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <FiCheck /> {message}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {serverContent?.updated_at ? `Last updated: ${new Date(serverContent.updated_at).toLocaleString()}` : ''}
            {serverContent?.deleted_at ? ` • Deleted: ${new Date(serverContent.deleted_at).toLocaleString()}` : ''}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
            >
              <FiEye /> {preview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              <FiTrash2 /> Delete
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              <FiSave /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Section Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            maxLength={120}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content Items (6)
          </label>
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Icon
                    </label>
                    <select
                      value={item.icon}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], icon: e.target.value as IconKey };
                        setItems(next);
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="dollar">Affordable Pricing</option>
                      <option value="smile">Clean & Sanitized</option>
                      <option value="truck">Airport Delivery</option>
                      <option value="headphones">24/7 Support</option>
                      <option value="award">Trusted</option>
                      <option value="check">Easy Booking</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...items];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setItems(next);
                      }}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      maxLength={80}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setItems(next);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    rows={2}
                    maxLength={160}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {preview && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, idx) => {
                const Icon = iconMap[item.icon];
                return (
                  <div key={idx} className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-500/10">
                      <Icon className="h-7 w-7 text-gold-500" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete content section?"
        message="This will soft-delete the section and the website will revert to the default 6 items."
        confirmLabel={saving ? 'Deleting...' : 'Delete'}
        danger
        onCancel={() => {
          if (saving) return;
          setShowDeleteConfirm(false);
        }}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
