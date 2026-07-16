'use client';

import { useState, useEffect } from 'react';
import { FiUpload, FiImage, FiLayout, FiCheck, FiSave } from 'react-icons/fi';

export default function BrandingManager() {
  const [branding, setBranding] = useState({
    siteName: 'Mok Car Rental',
    logo: '',
    primaryColor: '#D4AF37',
    secondaryColor: '#1F2937',
    tagline: 'Premium Car Rental in Johor Bahru',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('siteBranding');
    if (saved) {
      setBranding(JSON.parse(saved));
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setBranding({ ...branding, logo: base64 });
        saveBranding({ ...branding, logo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    saveBranding(branding);
  };

  const saveBranding = async (data: typeof branding) => {
    setSaving(true);
    try {
      // Save to API first (source of truth)
      await fetch('/api/admin/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      localStorage.setItem('siteBranding', JSON.stringify(data));
      setMessage('Branding settings saved successfully!');
    } catch (error) {
      console.error('Failed to save branding to API:', error);
      setMessage('Saved locally only - API sync failed');
    } finally {
      setTimeout(() => setMessage(''), 3000);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Branding Management</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Customize your website's visual identity and branding
        </p>
      </div>

      {message && (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <FiCheck /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiImage /> Logo Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Logo
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo" className="max-h-20 mx-auto" />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500">
                    <FiImage size={48} className="mx-auto mb-2" />
                    <p>No logo uploaded</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload New Logo
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gold-50 dark:bg-gold-900/20 text-gold-600 dark:text-gold-400 rounded-lg cursor-pointer hover:bg-gold-100 dark:hover:bg-gold-900/30 transition-colors border-2 border-dashed border-gold-300 dark:border-gold-700"
                >
                  <FiUpload /> Choose Image
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Recommended size: 200x60px. Max file size: 2MB.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiLayout /> Color Scheme
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color (Gold)
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="w-16 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secondary Color (Dark)
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="w-16 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Preview:</p>
              <div
                className="px-4 py-2 rounded-lg text-white font-semibold inline-block"
                style={{ backgroundColor: branding.primaryColor }}
              >
                Sample Button
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Site Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={branding.siteName}
              onChange={(e) => setBranding({ ...branding, siteName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Enter your site name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={branding.tagline}
              onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Enter your tagline"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <FiSave />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
