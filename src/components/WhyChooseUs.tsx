'use client';

import { useEffect, useState } from 'react';
import { FiDollarSign, FiSmile, FiTruck, FiHeadphones, FiAward, FiCheckCircle } from 'react-icons/fi';

type IconKey = 'dollar' | 'smile' | 'truck' | 'headphones' | 'award' | 'check';

type WhyChooseItem = {
  icon: IconKey;
  title: string;
  description: string;
};

const iconMap: Record<IconKey, any> = {
  dollar: FiDollarSign,
  smile: FiSmile,
  truck: FiTruck,
  headphones: FiHeadphones,
  award: FiAward,
  check: FiCheckCircle,
};

const features = [
  {
    icon: 'dollar' as const,
    title: 'Affordable Pricing',
    description: 'Competitive rates without hidden charges. Best value for your money.',
  },
  {
    icon: 'smile' as const,
    title: 'Clean & Sanitized',
    description: 'All cars thoroughly cleaned and sanitized before every rental.',
  },
  {
    icon: 'truck' as const,
    title: 'Airport Delivery',
    description: 'Convenient pickup and drop-off at Senai Airport.',
  },
  {
    icon: 'headphones' as const,
    title: '24/7 Support',
    description: 'Round-the-clock customer support via WhatsApp.',
  },
  {
    icon: 'award' as const,
    title: 'Trusted by Singaporeans',
    description: 'Hundreds of satisfied customers from Singapore.',
  },
  {
    icon: 'check' as const,
    title: 'Easy Booking',
    description: 'Simple WhatsApp booking process. No complicated forms.',
  },
];

export default function WhyChooseUs() {
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsItems, setCmsItems] = useState<WhyChooseItem[]>([]);

  useEffect(() => {
    fetch('/api/content/why-choose', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!json?.ok) return;
        const data = json.data;
        const items = Array.isArray(data?.items) ? (data.items as unknown[]) : [];
        const normalized = items
          .map((raw: any) => {
            const icon = typeof raw?.icon === 'string' ? raw.icon : '';
            const title = typeof raw?.title === 'string' ? raw.title.trim() : '';
            const description = typeof raw?.description === 'string' ? raw.description.trim() : '';
            if (!['dollar', 'smile', 'truck', 'headphones', 'award', 'check'].includes(icon)) return null;
            if (!title || !description) return null;
            return { icon: icon as IconKey, title, description };
          })
          .filter(Boolean) as WhyChooseItem[];
        if (!normalized.length) return;
        setCmsTitle(typeof data.title === 'string' ? data.title : '');
        setCmsItems(normalized.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  if (cmsItems.length) {
    return (
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">{cmsTitle || 'Why Choose Mok Car Rental?'}</h2>
            <p className="section-subtitle">
              Experience the difference with our premium car rental service
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cmsItems.map((item, index) => {
              const Icon = iconMap[item.icon];
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-gray-50 hover:bg-gold-50 transition-colors duration-300 group"
                >
                  <div className="w-16 h-16 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4 group-hover:bg-gold-500 transition-colors duration-300">
                    <Icon className="w-8 h-8 text-gold-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Why Choose Mok Car Rental?</h2>
          <p className="section-subtitle">
            Experience the difference with our premium car rental service
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
            <div key={index} className="p-6 rounded-2xl bg-gray-50 hover:bg-gold-50 transition-colors duration-300 group">
              <div className="w-16 h-16 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4 group-hover:bg-gold-500 transition-colors duration-300">
                <Icon className="w-8 h-8 text-gold-500 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
