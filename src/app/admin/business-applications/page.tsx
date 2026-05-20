'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import BusinessApplicationsManager from '@/components/admin/BusinessApplicationsManager';

export default function BusinessApplicationsPage() {
  return (
    <AdminLayout>
      <BusinessApplicationsManager />
    </AdminLayout>
  );
}

