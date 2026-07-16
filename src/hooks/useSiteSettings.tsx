'use client';

import { useState, useEffect, createContext, useContext } from 'react';

export interface SiteSettings {
  businessName: string;
  whatsappNumber: string;
  email: string;
  address: string;
  workingHours: string;
  currency: string;
  timezone: string;
  facebookUrl: string;
  instagramUrl: string;
  mapsEmbedUrl: string;
  siteUrl: string;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  autoConfirm: boolean;
}

const defaultSettings: SiteSettings = {
  businessName: 'Car Rental',
  whatsappNumber: '',
  email: '',
  address: '',
  workingHours: '',
  currency: 'MYR',
  timezone: 'Asia/Kuala_Lumpur',
  facebookUrl: '',
  instagramUrl: '',
  mapsEmbedUrl: '',
  siteUrl: '',
  emailNotifications: true,
  whatsappNotifications: true,
  autoConfirm: false,
};

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  getWhatsAppLink: (message?: string) => string;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  getWhatsAppLink: () => '#',
  loading: true,
});

export const useSiteSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const readFromStorage = (): SiteSettings => {
    try {
      const saved = localStorage.getItem('siteSettings');
      if (!saved) return defaultSettings;
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
    } catch (e) {
      console.error('Error reading settings:', e);
      return defaultSettings;
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const res = await fetch('/api/content/site-settings', { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        const items = json?.data?.items;
        if (items && typeof items === 'object') {
          const merged = { ...defaultSettings, ...items } as SiteSettings;
          setSettings(merged);
          localStorage.setItem('siteSettings', JSON.stringify(merged));
          window.dispatchEvent(new Event('settings-updated'));
        } else {
          setSettings(readFromStorage());
        }
      } catch {
        setSettings(readFromStorage());
      } finally {
        setLoading(false);
      }
      setLoading(false);
    };
    void boot();
  }, []);

  useEffect(() => {
    const apply = () => setSettings(readFromStorage());

    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'siteSettings') return;
      apply();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('settings-updated', apply);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('settings-updated', apply);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await fetch('/api/content/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      localStorage.setItem('siteSettings', JSON.stringify(updated));
      window.dispatchEvent(new Event('settings-updated'));
      console.info('IK: siteSettings updated');
    } catch (e) {
      console.error('IK: Error saving settings:', e);
      localStorage.setItem('siteSettings', JSON.stringify(updated));
      throw e;
    }
  };

  const getWhatsAppLink = (message?: string): string => {
    const number = settings.whatsappNumber.replace(/[^0-9]/g, '');
    if (!number) return '#';
    const defaultMessage = `Hello ${settings.businessName}, I would like to inquire about car rental.`;
    const encodedMessage = encodeURIComponent(message || defaultMessage);
    return `https://wa.me/${number}?text=${encodedMessage}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, getWhatsAppLink, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}
