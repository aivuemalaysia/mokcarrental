'use client';

import Link from 'next/link';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Footer() {
  const { settings } = useSiteSettings();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="text-2xl font-display font-bold mb-4">
              {settings.businessName}
            </div>
            <p className="text-gray-400 mb-6">
              Your trusted partner for premium car rentals in Johor Bahru,
              Malaysia. Serving Singapore customers and tourists since 2020.
            </p>
            <div className="flex gap-4">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center hover:bg-gold-500 transition-colors"
                >
                  <span className="text-gold-500 hover:text-white">FB</span>
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center hover:bg-gold-500 transition-colors"
                >
                  <span className="text-gold-500 hover:text-white">IG</span>
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-gold-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/cars" className="text-gray-400 hover:text-gold-500 transition-colors">
                  Our Fleet
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-gold-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-gold-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
<li><Link href="/contact" className="text-gray-400 hover:text-gold-500 transition-colors">Airport Delivery at Senai</Link></li>
<li><Link href="/cars" className="text-gray-400 hover:text-gold-500 transition-colors">Self Drive Car Rental JB</Link></li>
<li><Link href="/booking" className="text-gray-400 hover:text-gold-500 transition-colors">Corporate Car Rental Johor Bahru</Link></li>
<li><Link href="/faq" className="text-gray-400 hover:text-gold-500 transition-colors">Singapore to JB Car Rental</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMapPin className="w-5 h-5 text-gold-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  {settings.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a href={`tel:${settings.whatsappNumber}`} className="text-gray-400 hover:text-gold-500 transition-colors">
                  {settings.whatsappNumber}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="text-gray-400 hover:text-gold-500 transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiClock className="w-5 h-5 text-gold-500 flex-shrink-0" />
                <span className="text-gray-400">{settings.workingHours} Support</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-gray-400 hover:text-gold-500 text-sm transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-gold-500 text-sm transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
