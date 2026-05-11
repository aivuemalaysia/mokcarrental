'use client';

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiCar, FiMessageCircle, FiDollarSign, FiUsers } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { Inquiry, Car } from '@/types';
import AuditLogViewer from './AuditLogViewer';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    monthlyRevenue: 0,
    avgDailyRate: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: cars } = await supabase.from('cars').select('*');
      const { data: inquiries } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (cars && inquiries) {
        setStats({
          totalCars: cars.length,
          availableCars: cars.filter((c: Car) => c.available).length,
          totalInquiries: inquiries.length,
          pendingInquiries: inquiries.filter((i: Inquiry) => i.status === 'pending').length,
          monthlyRevenue: inquiries.length * 200,
          avgDailyRate: cars.reduce((sum: number, c: Car) => sum + c.price, 0) / cars.length,
        });
        setRecentInquiries(inquiries);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Cars',
      value: stats.totalCars,
      icon: FiCar,
      trend: '+12%',
      trendUp: true,
      color: 'bg-blue-500',
    },
    {
      title: 'Available Now',
      value: stats.availableCars,
      icon: FiCar,
      trend: '100%',
      trendUp: true,
      color: 'bg-green-500',
    },
    {
      title: 'Total Inquiries',
      value: stats.totalInquiries,
      icon: FiMessageCircle,
      trend: '+23%',
      trendUp: true,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Review',
      value: stats.pendingInquiries,
      icon: FiMessageCircle,
      trend: '-5%',
      trendUp: false,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your business performance and growth
          </p>
        </div>
        <button className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon size={24} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  stat.trendUp ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.trendUp ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                <span>{stat.trend}</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Inquiries</h3>
          <div className="space-y-4">
            {recentInquiries.map((inquiry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold">
                    {inquiry.customer_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {inquiry.customer_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {inquiry.car_name} • {inquiry.pickup_date}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    inquiry.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : inquiry.status === 'confirmed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {inquiry.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Business Performance
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Monthly Revenue
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  RM {stats.monthlyRevenue.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gold-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.monthlyRevenue / 10000) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Average Daily Rate
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  RM {stats.avgDailyRate.toFixed(0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.avgDailyRate / 400) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fleet Utilization
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {Math.round((stats.availableCars / stats.totalCars) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.availableCars / stats.totalCars) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left">
            <div className="text-2xl mb-2">🚗</div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Add New Car</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Expand your fleet</p>
          </button>
          <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left">
            <div className="text-2xl mb-2">✅</div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Review Inquiries</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats.pendingInquiries} pending
            </p>
          </button>
          <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="font-semibold text-gray-900 dark:text-white">View Reports</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analyze performance</p>
          </button>
          <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left">
            <div className="text-2xl mb-2">⚙️</div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Settings</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Configure system</p>
          </button>
        </div>
      </div>

      <AuditLogViewer />
    </div>
  );
}
