/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return '';
    return new URL(url).hostname;
  } catch {
    return '';
  }
})();

const nextConfig = {
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', supabaseHost].filter(Boolean),
    unoptimized: true,
  },
}

module.exports = nextConfig
