import type { MetadataRoute } from 'next';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { canonicalFor, STATIC_INDEXABLE_PATHS } from '@/lib/seo';

/**
 * Keep canonical, crawlable marketing URLs in the sitemap. Do not claim
 * a new modification timestamp for unchanged static content on every build.
 * Legacy vehicle detail URLs are retained during the SEO migration audit.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = STATIC_INDEXABLE_PATHS.map((path) => ({
    url: canonicalFor(path),
  }));

  let carPages: MetadataRoute.Sitemap = [];
  try {
    const client = getSupabaseServerClient();
    const { data, error } = await client
      .from('cars')
      .select('id,updated_at,available')
      .eq('available', true);
    if (error) throw error;
    carPages = (data || [])
      .filter((car: { id: string }) => /^[a-f0-9-]{36}$/i.test(car.id))
      .map((car: { id: string; updated_at?: string | null }) => {
        const lastModified = car.updated_at ? new Date(car.updated_at) : undefined;
        return {
          url: canonicalFor('/cars/' + car.id),
          ...(lastModified && !Number.isNaN(lastModified.getTime()) ? { lastModified } : {}),
        };
      });
  } catch (error) {
    // Static SEO routes stay available even when the website's legacy fleet DB
    // is inaccessible at build time. Preserve URLs until their migration is reviewed.
    console.error('SEO sitemap: legacy vehicle query failed', error);
  }
  return [...staticPages, ...carPages];
}
