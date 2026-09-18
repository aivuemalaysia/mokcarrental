'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiMail, FiPhone, FiClock, FiAlertCircle } from 'react-icons/fi';

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
};

export default function ContactsManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [tableMissing, setTableMissing] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/contacts', { cache: 'no-store' });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) return;
      setContacts(json.data || []);
      setTableMissing(Boolean(json.tableMissing));
      setTableError(json.tableError || null);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    const t = window.setInterval(fetchContacts, 30_000);
    return () => window.clearInterval(t);
  }, []);

  const filteredContacts = contacts.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (tableMissing) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Contact form submissions</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">
                contacts table not found in database
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Run the migration SQL in your Supabase dashboard:
              </p>
              <pre className="mt-3 text-xs bg-red-100 dark:bg-red-950 p-3 rounded-lg overflow-x-auto">
                {`CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service can insert contacts" ON contacts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can view contacts" ON contacts
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE INDEX IF NOT EXISTS contacts_created_at_idx ON contacts (created_at DESC);`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Contact form submissions from the "Send Us a Message" form
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <div className="rounded-full bg-gray-100 px-3 py-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Total: {contacts.length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <FiMail className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold">
                      {contact.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{contact.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <FiClock />
                    {formatDate(contact.created_at)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {contact.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Message Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <a
                    href={`https://wa.me/${selectedContact.phone?.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    className="text-gold-500 hover:underline"
                  >
                    {selectedContact.phone}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="text-gold-500 hover:underline"
                >
                  {selectedContact.email}
                </a>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {selectedContact.message}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Received
                </label>
                <p className="text-gray-900 dark:text-white">{formatDate(selectedContact.created_at)}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <a
                  href={`mailto:${selectedContact.email}?subject=Re: Your message to Mok Car Rental`}
                  className="flex-1 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <FiMail /> Reply
                </a>
                <a
                  href={`https://wa.me/${selectedContact.phone?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FiPhone /> WhatsApp
                </a>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedContact(null)}
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
