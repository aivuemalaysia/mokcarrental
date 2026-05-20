'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import WhyChooseContentManager from '@/components/admin/WhyChooseContentManager';
import PickupLocationsManager from '@/components/admin/PickupLocationsManager';

export default function ContentPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <WhyChooseContentManager />
        <PickupLocationsManager />
      </div>
    </AdminLayout>
  );
}
