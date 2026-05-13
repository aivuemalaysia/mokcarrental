'use client';

import { SettingsProvider } from '@/hooks/useSiteSettings';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ClientErrorMonitor from '@/components/ClientErrorMonitor';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ClientErrorMonitor />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
    </SettingsProvider>
  );
}
