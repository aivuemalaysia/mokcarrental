'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import CarFleetManager from '@/components/admin/CarFleetManager';

export default function CarsPage() {
  return (
    <AdminLayout>
      <CarFleetManager />
    </AdminLayout>
  );
}
