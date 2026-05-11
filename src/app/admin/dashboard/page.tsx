'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiLogOut, FiPackage, FiMessageCircle, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { Car, Inquiry } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [carList, setCarList] = useState<Car[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (inquiriesError) {
        console.error('Error fetching inquiries:', inquiriesError);
      } else {
        setInquiries(inquiriesData || []);
      }

      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (carsError) {
        console.error('Error fetching cars:', carsError);
      } else {
        setCarList(carsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const totalRevenue = inquiries.length * 200;
  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-display font-bold">
                Mok Car Rental <span className="text-gradient">Admin</span>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your rentals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-gold-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{carList.length}</div>
                <div className="text-gray-600 text-sm">Total Cars</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FiMessageCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{inquiries.length}</div>
                <div className="text-gray-600 text-sm">Total Inquiries</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <FiMessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingInquiries}</div>
                <div className="text-gray-600 text-sm">Pending Inquiries</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'inquiries'
                    ? 'text-gold-500 border-b-2 border-gold-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inquiries
              </button>
              <button
                onClick={() => setActiveTab('cars')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'cars'
                    ? 'text-gold-500 border-b-2 border-gold-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cars
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'inquiries' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Booking Inquiries</h2>
                {loading ? (
                  <p className="text-gray-600">Loading inquiries...</p>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No inquiries yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry, index) => (
                      <div key={inquiry.id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{inquiry.customerName}</h3>
                            <p className="text-sm text-gray-600">{inquiry.whatsappNumber}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            inquiry.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : inquiry.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {inquiry.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Car:</span>
                            <span className="ml-2 font-medium">{inquiry.carName}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Pickup:</span>
                            <span className="ml-2 font-medium">{inquiry.pickupDate}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Return:</span>
                            <span className="ml-2 font-medium">{inquiry.returnDate}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <span className="ml-2 font-medium">{inquiry.pickupLocation}</span>
                          </div>
                        </div>
                        {inquiry.notes && (
                          <p className="mt-3 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {inquiry.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'cars' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Car Fleet</h2>
                  <button className="btn-primary flex items-center gap-2">
                    <FiPlus />
                    Add Car
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-3 font-semibold">Car</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Price</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carList.map((car) => (
                        <tr key={car.id} className="border-b last:border-0">
                          <td className="py-4 font-medium">{car.name}</td>
                          <td className="py-4 capitalize">{car.category}</td>
                          <td className="py-4">RM{car.price}/day</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              car.available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {car.available ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <FiEdit />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
