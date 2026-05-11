# Mok Car Rental - Johor Bahru Car Rental Website

A premium, modern car rental website built with Next.js, React, TypeScript, and TailwindCSS. Designed for a Johor Bahru (JB) car rental company targeting Singapore customers, tourists, and locals.

## 🚗 Features

### Customer Features
- **Responsive Homepage** with hero section, featured cars, and testimonials
- **Car Fleet Listing** with category filters (Economy, Sedan, SUV, MPV, Luxury)
- **Detailed Car Pages** with specifications, features, and booking options
- **WhatsApp Integration** for instant booking inquiries
- **Online Booking Form** with Supabase backend
- **Contact Form** and business information
- **FAQ Section** for common questions
- **SEO Optimized** with meta tags, sitemap, and structured data

### Admin Features
- **Secure Admin Dashboard** with login protection
- **Inquiry Management** - View and manage booking inquiries
- **Car Fleet Management** - Add, edit, and manage vehicles
- **Statistics Dashboard** - Total cars, inquiries, and pending bookings

## 🎨 Design

- **Color Scheme**: Black, White, Gold (#D4AF37)
- **Style**: Modern, premium, luxury minimalist
- **Typography**: Inter & Playfair Display
- **Responsive**: Mobile-first design
- **Animations**: Smooth transitions and hover effects

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS
- **Icons**: React Icons
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
mok-car-rental/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── about/
│   │   ├── admin/           # Admin dashboard
│   │   ├── api/
│   │   ├── booking/
│   │   ├── cars/            # Car listing & details
│   │   ├── contact/
│   │   ├── faq/
│   │   ├── privacy/
│   │   ├── terms/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/          # Reusable components
│   ├── data/               # Static car data
│   ├── lib/                # Supabase client
│   ├── types/              # TypeScript types
│   └── globals.css         # Global styles
├── supabase/               # Database schema
├── public/                 # Static assets
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended)
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mok-car-rental
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. Set up Supabase database:
   - Create a new Supabase project
   - Run the schema from `supabase/schema.sql`
   - Configure Row Level Security (RLS)

6. Start the development server:
```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## 📱 Pages

- **/** - Homepage with all sections
- **/cars** - Car fleet listing with filters
- **/cars/[id]** - Individual car details
- **/about** - About us page
- **/faq** - Frequently asked questions
- **/contact** - Contact form and info
- **/booking** - Online booking inquiry form
- **/terms** - Terms & conditions
- **/privacy** - Privacy policy
- **/admin/login** - Admin login
- **/admin/dashboard** - Admin dashboard

## 🔐 Admin Access

Default credentials:
- **Email**: admin@mokcarrental.com
- **Password**: admin123

⚠️ Change these credentials in production!

## 💬 WhatsApp Integration

The website uses WhatsApp for booking inquiries:
- **Phone Number**: +60 12-345 6789 (configurable)
- **Pre-filled Messages**: Customer details and rental dates

## 🎯 SEO

The website is fully SEO optimized with:
- Dynamic meta titles and descriptions
- Open Graph tags
- Twitter cards
- XML sitemap
- Robots.txt
- Semantic HTML

## 📊 Supabase Tables

### cars
Stores all rental vehicles with specifications, pricing, and availability.

### inquiries
Stores customer booking inquiries with contact details and rental preferences.

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to change the gold accent color:
```typescript
colors: {
  gold: {
    500: '#D4AF37', // Primary gold
    // ...
  },
}
```

### Cars Data
Update `src/data/cars.ts` to modify the car fleet information.

### WhatsApp Number
Update `src/lib/supabase.ts` to change the WhatsApp contact number:
```typescript
export const WHATSAPP_NUMBER = '+60123456789';
```

## 📄 License

This project is for demonstration purposes.

## 🤝 Contact

For inquiries about this template:
- **WhatsApp**: +60 12-345 6789
- **Email**: info@mokcarrental.com

---

Built with ❤️ for Mok Car Rental, Johor Bahru
