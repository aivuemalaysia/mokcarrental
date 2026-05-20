'use client';

import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Get in touch with us for inquiries, bookings, or any questions
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                We'd love to hear from you. Whether you have a question about our services,
                pricing, or anything else, our team is ready to help.
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
                      {settings.whatsappNumber}
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
                      {settings.email}
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
                      {settings.workingHours} Support Available
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
                    <div className="text-5xl mb-4">✅</div>
                    <h4 className="text-xl font-bold mb-2">Thank You!</h4>
                    <p className="text-gray-600">
                      Your message has been sent. We'll get back to you soon!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        className="input-field"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        className="input-field"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+60 12-345 6789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        className="input-field resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="How can we help you?"
                      />
                    </div>

                    <button type="submit" className="btn-primary w-full">
                      Send Message
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
                    title="Location"
                  />
                ) : (
                  <div className="bg-gray-100 text-gray-700 p-6 text-sm">
                    Map is not configured yet. Set it in Admin → Settings.
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
