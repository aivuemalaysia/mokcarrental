import { MetadataRoute } from 'next';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

const baseUrl = process.env.SITE_URL || 'https://www.mokcarrental.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages — higher priority for key conversion pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/cars`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/start-business`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamic car pages from Supabase — each car is a unique SEO page
  let carPages: MetadataRoute.Sitemap = [];
  try {
    const client = getSupabaseServerClient(); const { data: cars } = await client
      .from('cars')
      .select('id, updated_at, available, featured')
      .eq('available', true);

    if (cars) {
      carPages = cars.map((car: any) => ({
        url: `${baseUrl}/cars/${car.id}`,
        lastModified: car.updated_at ? new Date(car.updated_at) : new Date(),
        changeFrequency: car.featured ? 'weekly' : 'monthly',
        priority: car.featured ? 0.9 : 0.75,
      }));
    }
  } catch (err) {
    console.error('Sitemap: Error fetching cars:', err);
  }

  return [...staticPages, ...carPages];
}
