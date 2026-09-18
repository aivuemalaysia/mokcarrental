'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import ContactsManager from '@/components/admin/ContactsManager';

export default function ContactsPage() {
  return (
    <AdminLayout>
      <ContactsManager />
    </AdminLayout>
  );
}
