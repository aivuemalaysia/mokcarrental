'use client';

import { SettingsProvider } from '@/hooks/useSiteSettings';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import ClientErrorMonitor from '@/components/ClientErrorMonitor';
import WhatsAppInquiryProvider from '@/components/WhatsAppInquiryProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <SettingsProvider>
      <WhatsAppInquiryProvider>
        <ClientErrorMonitor />
        <ErrorBoundary>
          {!isAdmin && <Navbar />}
          {children}
          {!isAdmin && <Footer />}
          {!isAdmin && <WhatsAppFloat />}
        </ErrorBoundary>
      </WhatsAppInquiryProvider>
    </SettingsProvider>
  );
}
