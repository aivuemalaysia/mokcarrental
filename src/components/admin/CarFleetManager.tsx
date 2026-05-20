'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import { Car } from '@/types';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import CarImageUploader from '@/components/admin/CarImageUploader';
import { DEFAULT_MIN_IMAGES_PER_CAR } from '@/lib/carImageConstraints';

export default function CarFleetManager() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setErrorMessage('');
      const res = await fetch('/api/admin/cars', { cache: 'no-store' });
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setErrorMessage(json?.error || 'Failed to load cars.');
        return;
      }
      setCars(json.data || []);
    } catch (error) {
      console.error('IK: Error fetching cars:', error);
      setErrorMessage('Failed to load cars.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleting) return;
    setDeleting(true);
    try {
      setErrorMessage('');
      console.info('IK: Deleting car', { id });
      const res = await fetch(`/api/admin/cars/${id}`, { method: 'DELETE' });
      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setErrorMessage(json?.error || 'Failed to delete car.');
        return;
      }
      await fetchCars();
    } catch (error) {
      console.error('IK: Error deleting car:', error);
      setErrorMessage('Failed to delete car.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || car.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Car Fleet Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your rental car inventory and pricing
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCar(null);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors flex items-center gap-2"
        >
          <FiPlus /> Add New Car
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        {errorMessage && (
          <div className="mb-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by car name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gold-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="economy">Economy</option>
              <option value="sedan">Sedan</option>
              <option value="mpv">MPV</option>
              <option value="suv">SUV</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Car</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Price/Day</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Seats</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map((car) => (
                <tr key={car.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{car.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{car.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm capitalize">
                      {car.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                    RM {car.price}
                  </td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{car.seats}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        car.available
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {car.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCar(car);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        aria-label={`Edit ${car.name}`}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(car)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                        aria-label={`Delete ${car.name}`}
                        disabled={deleting}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No cars found</p>
          </div>
        )}
      </div>

      {showModal && (
        <CarModal
          car={editingCar}
          onClose={() => {
            setShowModal(false);
            setEditingCar(null);
          }}
          onSave={fetchCars}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete car?"
        message={
          deleteTarget
            ? `This will permanently delete “${deleteTarget.name}” and any related inquiries.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        danger
        onCancel={() => {
          if (deleting) return;
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          void handleDelete(deleteTarget.id);
        }}
      />
    </div>
  );
}

function CarModal({
  car,
  onClose,
  onSave,
}: {
  car: Car | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: car?.name || '',
    brand: car?.brand || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    vin: car?.vin || '',
    status: car?.status || (car?.available ? 'available' : 'unavailable'),
    category: car?.category || 'economy',
    price: car?.price || 0,
    seats: car?.seats || 5,
    transmission: car?.transmission || 'automatic',
    fuel_type: car?.fuel_type || 'petrol',
    featuresText: car?.features?.join('\n') || '',
    description: car?.description || '',
    featured: car?.featured ?? false,
  });
  const [carId, setCarId] = useState<string>(car?.id || '');
  const [imageCount, setImageCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFinish = async () => {
    if (!car && carId && imageCount < DEFAULT_MIN_IMAGES_PER_CAR) {
      setErrorMessage(`Please upload at least ${DEFAULT_MIN_IMAGES_PER_CAR} images before finishing.`);
      return;
    }

    if (!car && carId) {
      try {
        const res = await fetch(`/api/admin/cars/${carId}/finalize`, { method: 'POST' });
        if (res.status === 401) {
          router.replace('/admin/login');
          return;
        }
        const json = await res.json().catch(() => null);
        if (!json?.ok) {
          setErrorMessage(json?.error || 'Failed to finalize car listing.');
          return;
        }
      } catch {
        setErrorMessage('Failed to finalize car listing.');
        return;
      }
    }

    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      const wasCarId = carId;
      if (!car && wasCarId && imageCount < DEFAULT_MIN_IMAGES_PER_CAR) {
        setErrorMessage(`Please upload at least ${DEFAULT_MIN_IMAGES_PER_CAR} images before finishing.`);
        return;
      }
      if (!formData.brand.trim()) {
        setErrorMessage('Make is required.');
        return;
      }
      if (!formData.model.trim()) {
        setErrorMessage('Model is required.');
        return;
      }
      if (!String(formData.year).trim()) {
        setErrorMessage('Year is required.');
        return;
      }
      if (!formData.vin.trim()) {
        setErrorMessage('VIN is required.');
        return;
      }

      const features = formData.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        vin: formData.vin,
        status: formData.status,
        category: formData.category,
        price: formData.price,
        seats: formData.seats,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        features,
        description: formData.description,
        featured: formData.featured,
      };

      if (carId) {
        const res = await fetch(`/api/admin/cars/${carId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.status === 401) {
          router.replace('/admin/login');
          return;
        }
        const json = await res.json().catch(() => null);
        if (!json?.ok) {
          setErrorMessage(json?.error || 'Failed to save car.');
          return;
        }
      } else {
        const res = await fetch('/api/admin/cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.status === 401) {
          router.replace('/admin/login');
          return;
        }
        const json = await res.json().catch(() => null);
        if (!json?.ok) {
          setErrorMessage(json?.error || 'Failed to save car.');
          return;
        }
        if (json?.data?.id) {
          setCarId(json.data.id);
        }
      }
      await onSave();
      if (car) {
        onClose();
      } else if (wasCarId) {
        onClose();
      } else {
        setErrorMessage(`Car saved. Please upload at least ${DEFAULT_MIN_IMAGES_PER_CAR} images before finishing.`);
      }
    } catch (error) {
      console.error('IK: Error saving car:', error);
      setErrorMessage('Failed to save car.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {car ? 'Edit Car' : 'Add New Car'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
              {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Car Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Make
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model
              </label>
              <input
                type="text"
                required
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'available' | 'unavailable' | 'maintenance',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              VIN
            </label>
            <input
              type="text"
              required
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'economy' | 'sedan' | 'suv' | 'mpv' | 'luxury' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="economy">Economy</option>
                <option value="sedan">Sedan</option>
                <option value="mpv">MPV</option>
                <option value="suv">SUV</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (RM/day)
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seats
              </label>
              <input
                type="number"
                required
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transmission
              </label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value as 'automatic' | 'manual' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fuel Type
              </label>
              <select
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value as 'petrol' | 'diesel' | 'hybrid' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {carId && (
            <CarImageUploader
              carId={carId}
              minImages={DEFAULT_MIN_IMAGES_PER_CAR}
              onCountChange={(count) => setImageCount(count)}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Features (one per line)
            </label>
            <textarea
              rows={3}
              value={formData.featuresText}
              onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Featured on homepage</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => void handleFinish()}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {car ? 'Cancel' : carId ? 'Finish' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
            >
              {saving ? 'Saving...' : carId || car ? 'Update Car' : 'Save & Upload Images'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
