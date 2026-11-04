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
  const isAdmin = usePathname().startsWith('/admin');
  return (
    <SettingsProvider>
      <WhatsAppInquiryProvider>
        <ClientErrorMonitor />
        <ErrorBoundary>
          {isAdmin ? children : (
            <div className="mok-marketing min-h-screen">
              <Navbar />
              {children}
              <Footer />
              <WhatsAppFloat />
            </div>
          )}
        </ErrorBoundary>
      </WhatsAppInquiryProvider>
    </SettingsProvider>
  );
}
