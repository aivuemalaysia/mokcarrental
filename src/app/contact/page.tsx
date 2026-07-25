'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMapPin, FiPhone, FiMail, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useWhatsAppInquiry } from '@/components/WhatsAppInquiryProvider';

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const { openInquiry } = useWhatsAppInquiry();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to send' }));
        throw new Error(errData.error || 'Something went wrong');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try WhatsApp.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-20">
      <nav aria-label="Breadcrumb" className="bg-gray-50 py-3">
        <div className="container-custom">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li><Link href="/" className="hover:text-gold-500">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">Contact Us</li>
          </ol>
        </div>
      </nav>

      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Contact MOK Car Rental — Book Your Car in Johor Bahru
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Get in touch for inquiries, bookings, or any questions — we typically respond within 30 minutes via WhatsApp
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                We&apos;d love to hear from you. Whether you have a question about our services,
                pricing, availability of Alphard or luxury MPV rentals, or anything else, our team is ready to help.
                Most Singaporean customers reach us via WhatsApp for the fastest response.
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiMapPin className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Our Location</h3>
                    <p className="text-gray-600">
                      {settings.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiPhone className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Phone / WhatsApp</h3>
                    <a
                      href={`tel:${settings.whatsappNumber}`}
                      className="text-gold-500 hover:text-gold-600"
                    >
                      {settings.whatsappNumber || '+60 XX-XXXXXXX'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-gold-500 hover:text-gold-600"
                    >
                      {settings.email || 'info@mokcarrental.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <FiClock className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      {settings.workingHours || 'Daily 8:00 AM - 10:00 PM'} Support Available
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-4">Quick Contact</h3>
                <button
                  type="button"
                  onClick={() => openInquiry()}
                  className="btn-whatsapp text-lg"
                >
                  Chat on WhatsApp
                </button>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>

                {submitted ? (
                  <div className="text-center py-12">
                    <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold mb-2">Thank You!</h4>
                    <p className="text-gray-600 mb-6">
                      Your message has been sent successfully. We&apos;ll get back to you within 30 minutes.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', message: '' }); }}
                      className="text-gold-500 hover:text-gold-600 font-medium"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="input-field"
                        autoComplete="name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          className="input-field"
                          autoComplete="email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+60 12-345 6789"
                          className="input-field"
                          autoComplete="tel"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Inquiry *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="I would like to enquire about car rental in Johor Bahru for my upcoming trip..."
                        className="input-field resize-none"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>

              <div className="mt-8 rounded-2xl overflow-hidden shadow-lg">
                {settings.mapsEmbedUrl ? (
                  <iframe
                    src={settings.mapsEmbedUrl}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mok Car Rental Location in Johor Bahru"
                  />
                ) : (
                  <div className="bg-gray-100 text-gray-700 p-6 text-sm">
                    Map location in Johor Bahru will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
