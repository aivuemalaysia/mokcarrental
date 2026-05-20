'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiEye, FiRefreshCw, FiX } from 'react-icons/fi';

type BusinessApplication = {
  id: string;
  owner_name: string;
  contact_number: string;
  email: string | null;
  business_name: string | null;
  car_make: string | null;
  car_model: string | null;
  car_year: number | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

type ApplicationImage = {
  id: string;
  medium_url: string;
  original_url: string;
  thumb_url: string;
  sort_order: number;
};

type ApplicationDetails = {
  application: BusinessApplication;
  images: ApplicationImage[];
};

type DiagnosticsResponse = {
  env: {
    supabaseHost: string | null;
    NEXT_PUBLIC_SUPABASE_URL: boolean;
    SUPABASE_SERVICE_ROLE_KEY: boolean;
  };
  schema: {
    reloaded: boolean;
    businessApplicationsTableOk: boolean;
    businessApplicationsTableError: string | null;
    businessApplicationImagesTableOk: boolean;
    businessApplicationImagesTableError: string | null;
  };
};

export default function BusinessApplicationsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BusinessApplication['status']>('pending');
  const [rows, setRows] = useState<BusinessApplication[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResponse | null>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('adminUser');
      const parsed = raw ? JSON.parse(raw) : null;
      const email = typeof parsed?.email === 'string' ? parsed.email : '';
      setAdminEmail(email);
    } catch {}
  }, []);

  const hasMissingTableError = (message: string) =>
    message.includes("Could not find the table 'public.business_applications' in the schema cache") ||
    message.includes("Database table 'business_applications' is missing") ||
    message.includes("Could not find the table 'public.business_application_images' in the schema cache") ||
    message.includes("Database table 'business_application_images' is missing");

  const loadDiagnostics = async () => {
    setDiagnosticsLoading(true);
    try {
      const res = await fetch('/api/admin/diagnostics/business-applications', { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setDiagnostics(null);
        return;
      }
      setDiagnostics(json.data as DiagnosticsResponse);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const reloadSchema = async () => {
    setDiagnosticsLoading(true);
    try {
      const res = await fetch('/api/admin/diagnostics/reload-schema', { method: 'POST' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      await res.json().catch(() => null);
      await loadDiagnostics();
      await load();
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const qs = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const res = await fetch(`/api/admin/business-applications${qs}`, { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        const message = json?.error || 'Failed to load applications.';
        setError(message);
        if (hasMissingTableError(message)) {
          void loadDiagnostics();
        }
        setLoading(false);
        return;
      }
      setRows((json.data || []) as BusinessApplication[]);
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [statusFilter]);

  const counts = useMemo(() => {
    const pending = rows.filter((r) => r.status === 'pending').length;
    const approved = rows.filter((r) => r.status === 'approved').length;
    const rejected = rows.filter((r) => r.status === 'rejected').length;
    return { pending, approved, rejected, total: rows.length };
  }, [rows]);

  const openDetails = async (id: string) => {
    setError('');
    setSelectedId(id);
    setDetails(null);
    setAdminNotes('');
    try {
      const res = await fetch(`/api/admin/business-applications/${id}`, { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setError(json?.error || 'Failed to load application.');
        return;
      }
      const data = json.data as ApplicationDetails;
      setDetails(data);
      setAdminNotes(data.application.admin_notes || '');
    } catch {
      setError('Failed to load application.');
    }
  };

  const updateStatus = async (status: BusinessApplication['status']) => {
    if (!selectedId) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/business-applications/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(adminEmail ? { 'x-admin-email': adminEmail } : {}),
        },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setError(json?.error || 'Failed to update status.');
        setSaving(false);
        return;
      }
      setRows((prev) => prev.map((r) => (r.id === selectedId ? { ...r, status, admin_notes: adminNotes || null } : r)));
      setSelectedId(null);
      setDetails(null);
    } catch {
      setError('Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Business Leads</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review partner applications. After approval, admin will manually create car listings.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <div className="rounded-full bg-gray-100 px-3 py-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              Total: {counts.total}
            </div>
            <div className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Pending: {counts.pending}
            </div>
            <div className="rounded-full bg-green-100 px-3 py-1 text-green-800 dark:bg-green-900 dark:text-green-200">
              Approved: {counts.approved}
            </div>
            <div className="rounded-full bg-red-100 px-3 py-1 text-red-800 dark:bg-red-900 dark:text-red-100">
              Rejected: {counts.rejected}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>

          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            <span className="inline-flex items-center gap-2">
              <FiRefreshCw /> Refresh
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      {error && hasMissingTableError(error) ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="font-semibold">Business Leads tables not found</div>
              <div className="text-sm opacity-90">
                This usually means the migration was not applied to the Supabase project your app is connected to, or the schema cache was not reloaded.
              </div>
              <div className="text-sm">
                Migration file: <span className="font-mono">supabase/migrations/014_business_applications.sql</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => loadDiagnostics()}
                disabled={diagnosticsLoading}
                className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm text-amber-900 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-900/30"
              >
                <span className="inline-flex items-center gap-2">
                  <FiRefreshCw /> {diagnosticsLoading ? 'Checking...' : 'Run Diagnostics'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => reloadSchema()}
                disabled={diagnosticsLoading}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                Reload Schema Cache
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg bg-white/70 p-3 text-sm dark:bg-black/20">
              <div className="font-semibold">Connected Supabase</div>
              <div className="mt-1 font-mono text-xs">
                {diagnostics?.env.supabaseHost || 'Unknown (run diagnostics)'}
              </div>
              <div className="mt-2 text-xs opacity-80">
                URL env set: {String(Boolean(diagnostics?.env.NEXT_PUBLIC_SUPABASE_URL))} • Service role key set:{' '}
                {String(Boolean(diagnostics?.env.SUPABASE_SERVICE_ROLE_KEY))}
              </div>
            </div>

            <div className="rounded-lg bg-white/70 p-3 text-sm dark:bg-black/20">
              <div className="font-semibold">Table Checks</div>
              <div className="mt-2 space-y-1 font-mono text-xs">
                <div>
                  business_applications: {String(Boolean(diagnostics?.schema.businessApplicationsTableOk))}
                  {diagnostics?.schema.businessApplicationsTableError ? ` • ${diagnostics.schema.businessApplicationsTableError}` : ''}
                </div>
                <div>
                  business_application_images: {String(Boolean(diagnostics?.schema.businessApplicationImagesTableOk))}
                  {diagnostics?.schema.businessApplicationImagesTableError
                    ? ` • ${diagnostics.schema.businessApplicationImagesTableError}`
                    : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-white/70 p-3 text-xs dark:bg-black/20">
            <div className="font-semibold">Supabase SQL check</div>
            <pre className="mt-2 whitespace-pre-wrap font-mono">
              {'select to_regclass(\'public.business_applications\') as business_applications,\n       to_regclass(\'public.business_application_images\') as business_application_images;'}
            </pre>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl bg-white shadow-sm overflow-hidden dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-600 dark:text-gray-300">
                    Loading...
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{row.owner_name}</div>
                      {row.business_name ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{row.business_name}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 dark:text-white">{row.contact_number}</div>
                      {row.email ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{row.email}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 dark:text-white">
                        {[row.car_make, row.car_model].filter(Boolean).join(' ') || '-'}
                      </div>
                      {row.car_year ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{row.car_year}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          row.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : row.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => openDetails(row.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                      >
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-600 dark:text-gray-300">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Application Details</h3>
                {details?.application ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {details.application.owner_name} • {details.application.contact_number}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setDetails(null);
                }}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <FiX className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </button>
            </div>

            {!details ? (
              <div className="py-10 text-center text-gray-600 dark:text-gray-300">Loading...</div>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="font-semibold text-gray-900 dark:text-white">Contact</div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <div>Owner: {details.application.owner_name}</div>
                      <div>Phone: {details.application.contact_number}</div>
                      <div>Email: {details.application.email || '-'}</div>
                      <div>Business: {details.application.business_name || '-'}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                    <div className="font-semibold text-gray-900 dark:text-white">Car</div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <div>Make: {details.application.car_make || '-'}</div>
                      <div>Model: {details.application.car_model || '-'}</div>
                      <div>Year: {details.application.car_year || '-'}</div>
                    </div>
                  </div>
                </div>

                {details.application.notes ? (
                  <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
                    <div className="font-semibold text-gray-900 dark:text-white mb-2">Notes</div>
                    <div className="whitespace-pre-wrap">{details.application.notes}</div>
                  </div>
                ) : null}

                <div>
                  <div className="font-semibold text-gray-900 dark:text-white mb-3">Photos</div>
                  {details.images.length ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {details.images.map((img) => (
                        <a
                          key={img.id}
                          href={img.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          <img src={img.medium_url} alt="Car photo" className="h-40 w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 dark:text-gray-300">No photos.</div>
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Admin Notes</div>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes (optional)"
                    disabled={saving}
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => updateStatus('rejected')}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-3 text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    <FiX /> Reject
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => updateStatus('approved')}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-5 py-3 text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    <FiCheck /> Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

