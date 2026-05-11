'use client';

import { SettingsProvider } from '@/hooks/useSiteSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </SettingsProvider>
  );
}
