'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWithTimeout = async (
    input: RequestInfo | URL,
    init: RequestInit | undefined,
    timeoutMs: number,
  ) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  useEffect(() => {
    fetchWithTimeout('/api/admin/session', undefined, 10000)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data?.authenticated) router.replace('/admin/dashboard');
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetchWithTimeout(
        '/api/admin/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
        15000,
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Invalid email or password');
        return;
      }

      localStorage.setItem(
        'adminUser',
        JSON.stringify(data?.data?.user || { email, name: 'Admin' }),
      );

      const sessionRes = await fetchWithTimeout('/api/admin/session', undefined, 10000);
      const sessionData = await sessionRes.json().catch(() => null);
      if (sessionRes.ok && sessionData?.data?.authenticated) {
        setLoading(false);
        router.replace('/admin/dashboard');
        return;
      }
      setError(
        sessionData?.error ||
          'Login succeeded but session is not active. Please refresh and try again.',
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
        return;
      }
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-3xl font-display font-bold text-gray-900 mb-2">
            Mok Car Rental <span className="text-gradient">Admin</span>
          </div>
          <p className="text-gray-600">Sign in to your admin dashboard</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mokcarrental.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gold-500 hover:text-gold-600">
              Back to Website
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          Use your admin credentials to sign in.
        </p>
      </div>
    </div>
  );
}
