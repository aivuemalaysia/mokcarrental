'use client';

import { useState, useEffect } from 'react';

import { Inquiry, Car } from '@/types';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { DEFAULT_PICKUP_LOCATIONS, PickupLocationItem } from '@/lib/pickupLocations';

export default function BookingPageClient({ initialCarId, rebookId = '', rebookWhatsapp = '' }: { initialCarId: string; rebookId?: string; rebookWhatsapp?: string }) {
  const { settings, getWhatsAppLink } = useSiteSettings();

  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [pickupLocations, setPickupLocations] = useState<PickupLocationItem[]>(DEFAULT_PICKUP_LOCATIONS);
  const [formData, setFormData] = useState<Partial<Inquiry>>({
    carId: initialCarId || '',
    carName: '',
    customerName: '',
    whatsappNumber: '',
    email: '',
    pickupDate: '',
    returnDate: '',
    pickupLocation: DEFAULT_PICKUP_LOCATIONS[0]?.label || '',
    notes: '',
    status: 'pending',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comingFromSG, setComingFromSG] = useState(false);
  const [lang, setLang] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    const loadPickupLocations = async () => {
      try {
        const res = await fetch('/api/content/pickup-locations', { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        const items = Array.isArray(json?.data?.items) ? (json.data.items as any[]) : [];
        const parsed = items
          .map((raw) => {
            const id = typeof raw?.id === 'string' ? raw.id : '';
            const label = typeof raw?.label === 'string' ? raw.label : '';
            if (!id || !label) return null;
            return { id, label };
          })
          .filter(Boolean) as PickupLocationItem[];

        if (parsed.length) {
          setPickupLocations(parsed);
          setFormData((prev) => {
            const current = typeof prev.pickupLocation === 'string' ? prev.pickupLocation : '';
            const stillValid = parsed.some((x) => x.label === current);
            return stillValid ? prev : { ...prev, pickupLocation: parsed[0].label };
          });
        }
      } catch {}
    };
    void loadPickupLocations();
  }, []);

  useEffect(() => {
    if (initialCarId && cars.length > 0) {
      const car = cars.find((c) => c.id === initialCarId);
      if (car) {
        setSelectedCar(car);
        setFormData((prev) => ({ ...prev, carId: car.id, carName: car.name }));
      }
    }
  }, [initialCarId, cars]);

  const fetchCars = async () => {
    try {
      const res = await fetch('/api/public/cars', { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      const data: Car[] = Array.isArray(json?.data?.cars) ? json.data.cars : [];
      const error = json?.ok ? null : json?.error ? new Error(String(json.error)) : null;


      if (error) {
        console.error('Error fetching cars:', error);
        return;
      }

      setCars(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: formData.carId,
          carName: formData.carName,
          customerName: formData.customerName,
          whatsappNumber: formData.whatsappNumber,
          email: formData.email,
          pickupDate: formData.pickupDate,
          returnDate: formData.returnDate,
          pickupLocation: formData.pickupLocation,
          notes: formData.notes,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        console.error('Error submitting inquiry:', json?.error);
        alert(json?.error || 'Failed to submit inquiry. Please try again.');
        return;
      }

      setSubmitted(true);

      const whatsappMessage = `Hello ${settings.businessName},

I have submitted a booking inquiry:

Car: ${formData.carName || 'Not selected'}
Name: ${formData.customerName}
WhatsApp: ${formData.whatsappNumber}
Email: ${formData.email || 'Not provided'}
Pickup Date: ${formData.pickupDate}
Return Date: ${formData.returnDate}
Pickup Location: ${formData.pickupLocation}
Notes: ${formData.notes || 'None'}

Please confirm my booking. Thank you!`;

      const whatsappUrl = getWhatsAppLink(whatsappMessage);

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCarSelect = (carId: string) => {
    const car = cars.find((c) => c.id === carId);
    if (car) {
      setSelectedCar(car);
      setFormData((prev) => ({ ...prev, carId, carName: car.name }));
    }
  };


  // -- i18n + live total --
  const t = (key: string) => {
    const dict: Record<string, { en: string; zh: string }> = {
      comingFromSG:   { en: "I\u0027m coming from Singapore", zh: "\u6211\u6765\u81ea\u65b0\u52a0\u5761" },
      licenseNote:    { en: "SG driving licence is accepted. No IDP required.", zh: "\u65b0\u52a0\u5761\u9a7e\u7167\u53ef\u76f4\u63a5\u4f7f\u7528\uff0c\u65e0\u9700IDP\u3002" },
      deposit:        { en: "Deposit", zh: "\u62bc\u91d1" },
      liveTotal:      { en: "Estimated total", zh: "\u9884\u8ba1\u603b\u989d" },
      daysUnit:       { en: "days", zh: "\u5929" },
      paymentOptions: { en: "Payment options", zh: "\u652f\u4ed8\u65b9\u5f0f" },
      tngWallet:      { en: "TNG eWallet", zh: "TNG eWallet" },
      bankTransfer:   { en: "Bank Transfer", zh: "\u94f6\u884c\u8f44\u8d26" },
      selectCar:      { en: "Select Your Car", zh: "\u9009\u62e9\u8f66\u8f86" },
      yourDetails:    { en: "Your Details", zh: "\u60a8\u7684\u8d44\u6599" },
      rentalDetails:  { en: "Rental Details", zh: "\u79df\u8c02\u8a72\u60c5" },
      pickupDate:     { en: "Pickup Date", zh: "\u53d6\u8f86\u65e5\u671f" },
      returnDate:     { en: "Return Date", zh: "\u5c0d\u8f86\u65e5\u671f" },
      pickupLocation: { en: "Pickup Location", zh: "\u53d6\u8f86\u5730\u9ede" },
      notesLabel:     { en: "Additional Notes", zh: "\u5099\u8a3c" },
      submitBtn:      { en: "Submit Inquiry & Book on WhatsApp", zh: "\u63d0\u4ea4\u5e76 WhatsApp \u9810\u8a02" },
      submitting:     { en: "Submitting...", zh: "\u63d0\u4ea4\u4e2d..." },
      fullName:       { en: "Full Name", zh: "\u59d3\u540d" },
      whatsappLabel:  { en: "WhatsApp Number", zh: "WhatsApp \u8655\u78bc" },
      emailLabel:     { en: "Email Address", zh: "\u96fb\u5b50\u90f5\u7bb1" },
    };
    return dict[key]?.[lang] ?? dict[key]?.en ?? key;
  };
  const SGD_RATE = 0.27; // approx 1 RM = 0.27 SGD (early 2026)
  const carPrice = selectedCar?.price ?? 0;
  const days = (() => {
    if (!formData.pickupDate || !formData.returnDate) return 0;
    const a = new Date(formData.pickupDate);
    const b = new Date(formData.returnDate);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
    return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
  })();
  const depositRM = carPrice > 0 ? carPrice : 0;
  const liveTotalRM = days > 0 ? days * carPrice + depositRM : 0;
  const liveTotalSGD = liveTotalRM > 0 ? Math.round(liveTotalRM * SGD_RATE * 100) / 100 : 0;

  const [rebookedFrom, setRebookedFrom] = useState('');

  // One-tap rebook: when arriving from /my-bookings?rebook=<id>&whatsapp=<n>,
  // fetch the customer's past bookings, find the matching inquiry, and
  // pre-fill car + name + contact so they only confirm dates and re-submit.
  useEffect(() => {
    if (!rebookId || !rebookWhatsapp) return;
    let cancelled = false;
    const loadRebook = async () => {
      try {
        const url = `/api/bookings?whatsapp=${encodeURIComponent(rebookWhatsapp)}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        if (!json?.ok || cancelled) return;
        const rows: any[] = Array.isArray(json?.data?.bookings) ? json.data.bookings : [];
        const match = rows.find((r) => r.id === rebookId) || rows[0];
        if (!match) return;
        setFormData((prev) => ({
          ...prev,
          carId: prev.carId || match.carId || '',
          carName: match.carName || prev.carName,
          customerName: match.customerName || prev.customerName,
          whatsappNumber: match.whatsapp || rebookWhatsapp,
          email: match.email || prev.email,
          pickupDate: match.pickupDate || prev.pickupDate,
          returnDate: match.returnDate || prev.returnDate,
          pickupLocation: match.pickupLocation || prev.pickupLocation,
        }));
        if (match?.carName) setRebookedFrom(match.carName);
      } catch {}
    };
    void loadRebook();
    return () => { cancelled = true; };
  }, [rebookId, rebookWhatsapp]);

  if (submitted) {
    const successWhatsAppLink = getWhatsAppLink(
      `Hello ${settings.businessName}, I just submitted a booking inquiry. Please confirm my booking. Thank you!`
    );

    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="container-custom">
          <div className="max-w-xl mx-auto text-center bg-white rounded-2xl p-12 shadow-xl">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold mb-4">Booking Inquiry Submitted!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your inquiry. We&apos;ve received your booking request and will contact
              you shortly via WhatsApp.
            </p>
            <a
              href={successWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-lg"
            >
              Continue on WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Book Your Car</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Fill out the form below and we&apos;ll get back to you shortly
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">{t('selectCar')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {cars.map((car) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => handleCarSelect(car.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.carId === car.id
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-gray-200 hover:border-gold-300'
                      }`}
                    >
                      <div className="text-sm font-bold">{car.name}</div>
                      <div className="text-xs text-gray-500">RM{car.price}/day{comingFromSG ? " ≈ S$" + (car.price * SGD_RATE).toFixed(2) : ""}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-bold">{t('yourDetails')}</h2>

                {/* SG toggle */}
                <label className="flex items-center gap-3 mb-3 p-3 bg-amber-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={comingFromSG}
                    onChange={(e) => setComingFromSG(e.target.checked)}
                    className="w-4 h-4 accent-gold-500"
                  />
                  <span className="text-sm font-medium text-amber-800">{t('comingFromSG')}</span>
                </label>
                {comingFromSG && (
                  <p className="text-xs text-amber-700 mb-3">{t('licenseNote')}</p>
                )}

                {/* Language toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`text-xs px-3 py-1 rounded-full ${lang === 'en' ? 'bg-gold-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >EN</button>
                  <button
                    type="button"
                    onClick={() => setLang('zh')}
                    className={`text-xs px-3 py-1 rounded-full ${lang === 'zh' ? 'bg-gold-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >中文</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="input-field"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      placeholder="+60 12-345 6789"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <h2 className="text-2xl font-bold pt-6">{t('rentalDetails')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="input-field"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="input-field"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location *
                  </label>
                  <select
                    required
                    className="input-field"
                    value={formData.pickupLocation}
                    onChange={(e) =>
                      setFormData({ ...formData, pickupLocation: e.target.value })
                    }
                  >
                    {pickupLocations.map((loc) => (
                      <option key={loc.id} value={loc.label}>
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    rows={4}
                    className="input-field resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requirements or questions?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.carId}
                  className="btn-whatsapp w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('submitting') : t('submitBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
