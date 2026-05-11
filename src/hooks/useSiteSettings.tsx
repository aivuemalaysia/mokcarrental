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
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  autoConfirm: boolean;
}

const defaultSettings: SiteSettings = {
  businessName: 'Mok Car Rental',
  whatsappNumber: '+60123456789',
  email: 'info@mokcarrental.com',
  address: 'Taman Molek, Johor Bahru, Malaysia',
  workingHours: '24/7',
  currency: 'MYR',
  timezone: 'Asia/Kuala_Lumpur',
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

  useEffect(() => {
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (e) {
        console.error('Error parsing settings:', e);
      }
    }
    setLoading(false);
  }, []);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('siteSettings', JSON.stringify(updated));
    window.dispatchEvent(new Event('settings-updated'));
  };

  const getWhatsAppLink = (message?: string): string => {
    const number = settings.whatsappNumber.replace(/[^0-9]/g, '');
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

export function getWhatsAppBookingLink(
  carName: string,
  pickupDate: string,
  returnDate: string,
  whatsappNumber?: string
): string {
  const number = (whatsappNumber || defaultSettings.whatsappNumber).replace(/[^0-9]/g, '');
  const message = `Hello Mok Car Rental,

I would like to inquire about car rental.

Car: ${carName}
Rental Date: ${pickupDate}
Return Date: ${returnDate}

Thank you!`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
}
