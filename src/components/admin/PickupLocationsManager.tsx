'use client';

import { useEffect, useState } from 'react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { DEFAULT_PICKUP_LOCATIONS, PickupLocationItem } from '@/lib/pickupLocations';

type SectionRow = {
  title: string | null;
  items: unknown;
  deleted_at: string | null;
};

function parseItems(input: unknown): PickupLocationItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((raw) => {
      const id = typeof raw?.id === 'string' ? raw.id : '';
      const label = typeof raw?.label === 'string' ? raw.label : '';
      if (!id || !label) return null;
      return { id, label };
    })
    .filter(Boolean) as PickupLocationItem[];
}

export default function PickupLocationsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('Pickup Locations');
  const [items, setItems] = useState<PickupLocationItem[]>(DEFAULT_PICKUP_LOCATIONS);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('adminUser');
    const parsed = raw ? JSON.parse(raw) : null;
    const email = typeof parsed?.email === 'string' ? parsed.email : '';
    setAdminEmail(email);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/content/pickup-locations', { cache: 'no-store' });
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        const json = await res.json().catch(() => null);
        if (!json?.ok) {
          setError(json?.error || 'Failed to load pickup locations.');
          return;
        }
        const row = json.data as SectionRow | null;
        const parsedItems = parseItems(row?.items);
        if (row?.deleted_at) {
          setTitle('Pickup Locations');
          setItems(DEFAULT_PICKUP_LOCATIONS);
          return;
        }
        if (typeof row?.title === 'string' && row.title.trim()) setTitle(row.title.trim());
        if (parsedItems.length) setItems(parsedItems);
      } catch {
        setError('Failed to load pickup locations.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const validate = () => {
    if (!title.trim()) return 'Title is required.';
    if (!items.length) return 'At least 1 pickup location is required.';
    if (items.length > 20) return 'Too many pickup locations (max 20).';
    const seen = new Set<string>();
    for (const item of items) {
      if (!item.label.trim()) return 'Pickup location name is required.';
      if (!item.id.trim()) return 'Invalid pickup location id.';
      if (seen.has(item.id)) return 'Pickup location ids must be unique.';
      seen.add(item.id);
    }
    return '';
  };

  const save = async () => {
    setError('');
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/content/pickup-locations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(adminEmail ? { 'x-admin-email': adminEmail } : {}),
        },
        body: JSON.stringify({ title: title.trim(), items }),
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setError(json?.error || 'Failed to save pickup locations.');
        return;
      }
    } catch {
      setError('Failed to save pickup locations.');
    } finally {
      setSaving(false);
    }
  };

  const softDelete = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content/pickup-locations', {
        method: 'DELETE',
        headers: {
          ...(adminEmail ? { 'x-admin-email': adminEmail } : {}),
        },
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setError(json?.error || 'Failed to delete pickup locations.');
        return;
      }
      setTitle('Pickup Locations');
      setItems(DEFAULT_PICKUP_LOCATIONS);
    } catch {
      setError('Failed to delete pickup locations.');
    } finally {
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-300">Loading pickup locations…</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pickup Locations</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Manage the selectable pickup locations shown on the booking form and WhatsApp inquiry modal.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900/30"
              disabled={saving}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => void save()}
              className="rounded-lg bg-gold-500 px-4 py-2 text-sm text-white hover:bg-gold-600 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Pickup Locations"
          />
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Locations</div>
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const id = crypto.randomUUID();
                setItems((prev) => [...prev, { id, label: '' }]);
              }}
              disabled={saving || items.length >= 20}
            >
              Add
            </button>
          </div>

          {items.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4 dark:border-gray-700 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={item.label}
                  onChange={(e) =>
                    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, label: e.target.value } : x)))
                  }
                  placeholder="e.g. Office Pickup"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled={saving || idx === 0}
                  onClick={() => {
                    setItems((prev) => {
                      const next = [...prev];
                      const tmp = next[idx - 1];
                      next[idx - 1] = next[idx];
                      next[idx] = tmp;
                      return next;
                    });
                  }}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                  disabled={saving || idx === items.length - 1}
                  onClick={() => {
                    setItems((prev) => {
                      const next = [...prev];
                      const tmp = next[idx + 1];
                      next[idx + 1] = next[idx];
                      next[idx] = tmp;
                      return next;
                    });
                  }}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900/30"
                  disabled={saving || items.length <= 1}
                  onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Reset pickup locations?"
        message="This will reset the pickup locations back to the default list."
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void softDelete()}
      />
    </>
  );
}

