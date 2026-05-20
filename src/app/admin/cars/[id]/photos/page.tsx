import AdminLayout from '@/components/admin/AdminLayout';
import CarImageUploader from '@/components/admin/CarImageUploader';
import { DEFAULT_MIN_IMAGES_PER_CAR } from '@/lib/carImageConstraints';

export default function CarPhotosPage({ params }: { params: { id: string } }) {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Car Photos</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Upload, view, and delete photos for this car.</p>
        </div>
        <CarImageUploader carId={params.id} minImages={DEFAULT_MIN_IMAGES_PER_CAR} />
      </div>
    </AdminLayout>
  );
}

