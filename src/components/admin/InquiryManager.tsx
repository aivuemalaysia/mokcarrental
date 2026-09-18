'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiMessageCircle, FiCheck, FiX, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { Inquiry } from '@/types';
import { subscribeToInquiries } from '@/lib/realtime/inquiries';
import { csrfFetch } from '@/lib/csrfFetch';

type InquiryStats = {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  latestCreatedAt: string | null;
  eventsTableOk: boolean;
  eventsTableWarning: string | null;
};

export default function InquiryManager() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState<InquiryStats | null>(null);

  const fetchInquiries = useCallback(async () => {
    try {
      setFetchError(null);
      const res = await fetch('/api/admin/inquiries', { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setFetchError(json?.error || 'Failed to fetch inquiries');
        setInquiries([]);
        return;
      }
      setInquiries(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Network error';
      console.error('IK: Error fetching inquiries:', error);
      setFetchError(msg);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inquiries/stats', { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) return;
      setStats(json.data as InquiryStats);
    } catch {}
  }, []);

  useEffect(() => {
    fetchInquiries();
    fetchStats();
    const sub = subscribeToInquiries(() => {
      fetchInquiries();
      fetchStats();
    });
    const t = window.setInterval(() => {
      fetchInquiries();
      fetchStats();
    }, 30_000);
    return () => {
      sub.unsubscribe();
      window.clearInterval(t);
    };
  }, [fetchInquiries, fetchStats]);

  const updateStatus = async (id: string, status: string) => {
    try {
      setUpdating(true);
      const res = await csrfFetch(`/api/admin/inquiries/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) throw new Error(json?.error || 'Failed to update inquiry status');
      setInquiries((prev) => prev.map((x) => (x.id === id ? { ...x, status: status as any } : x)));
      setSelectedInquiry((prev) => (prev?.id === id ? { ...prev, status: status as any } : prev));
      setSelectedInquiry(null);
      await fetchInquiries();
      await fetchStats();
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert('Failed to update inquiry status');
    } finally {
      setUpdating(false);
    }
  };

  const exportToExcel = () => {
    const rows = filteredInquiries;
    const headers = ['ID', 'Customer', 'WhatsApp', 'Email', 'Car', 'Pickup Date', 'Return Date', 'Pickup Location', 'Status', 'Notes', 'Created At'];
    const escapeXml = (v: any) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const xmlRows = rows.map((r) => {
      const cells = [
        r.id, r.customer_name, r.whatsapp_number, r.email, r.car_name,
        r.pickup_date, r.return_date, r.pickup_location, r.status, r.notes, r.created_at,
      ];
      return '<Row>' + cells.map((c) => `<Cell ss:DataType="String"><Data>${escapeXml(c)}</Data></Cell>`).join('') + '</Row>';
    }).join('');
    const headerRow = '<Row>' + headers.map((h) => `<Cell ss:StyleID="s62036301"><Data ss:Type="String">${h}</Data></Cell>`).join('') + '</Row>';
    const xml = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n<Worksheet ss:Name="Inquiries"><Table>\n${headerRow}\n${xmlRows}\n</Table></Worksheet></Workbook>`;
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.whatsapp_number?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return <div className="animate-pulse text-gray-500">Loading inquiries...</div>;
  }

  if (fetchError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Inquiry Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review and manage customer booking inquiries</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">Failed to load inquiries</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1 font-mono">{fetchError}</p>
            </div>
            <button
              onClick={() => { fetchInquiries(); fetchStats(); }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
            >
              <FiRefreshCw /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Inquiry Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and manage customer booking inquiries
            </p>
            {stats && (
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <div className="rounded-full bg-gray-100 px-3 py-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Total: {stats.total}
                </div>
                <div className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Pending: {stats.pending}
                </div>
                {stats.eventsTableOk ? null : (
                  <div className="rounded-full bg-red-100 px-3 py-1 text-red-800 dark:bg-red-900 dark:text-red-100">
                    Live updates degraded
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={exportToExcel}
            disabled={filteredInquiries.length === 0}
            className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors flex items-center gap-2 disabled:opacity-40"
          >
            <FiDownload /> Export to Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12">
            <FiMessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">No inquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Customer</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Car</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Dates</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Location</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-900 dark:text-white">{inquiry.customer_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{inquiry.whatsapp_number}</div>
                      {inquiry.email && <div className="text-xs text-gray-400">{inquiry.email}</div>}
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{inquiry.car_name}</td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {inquiry.pickup_date} <span className="text-gray-400">&rarr;</span> {inquiry.return_date}
                    </td>
                    <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{inquiry.pickup_location}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          inquiry.status || 'pending'
                        )}`}
                      >
                        {inquiry.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(inquiry.id!, 'confirmed'); }}
                        disabled={updating}
                        className="px-2 py-1 mr-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300"
                        title="Confirm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStatus(inquiry.id!, 'cancelled'); }}
                        disabled={updating}
                        className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300"
                        title="Cancel"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Inquiry Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedInquiry.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    WhatsApp Number
                  </label>
                  <a
                    href={`https://wa.me/${selectedInquiry.whatsapp_number?.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    className="text-gold-500 hover:underline"
                  >
                    {selectedInquiry.whatsapp_number}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white">
                  {selectedInquiry.email || 'Not provided'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Car
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedInquiry.car_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pickup Location
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedInquiry.pickup_location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Pickup Date
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedInquiry.pickup_date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Return Date
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedInquiry.return_date}</p>
                </div>
              </div>

              {selectedInquiry.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedInquiry.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => updateStatus(selectedInquiry.id!, 'confirmed')}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiCheck /> Confirm
                </button>
                <button
                  onClick={() => updateStatus(selectedInquiry.id!, 'cancelled')}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiX /> Cancel
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
