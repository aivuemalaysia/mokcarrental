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

## 🚢 Deployment Troubleshooting: “Deployment Not Found” (Vercel 404 NOT_FOUND)

### Most common causes (this repo)
- **Wrong Root Directory** in Vercel Project Settings: this repo’s Next.js app lives in `mok-car-rental/`. If Vercel builds from the repository root, it can deploy an empty/non-app output that serves Vercel’s `404: NOT_FOUND`.
- **Domain not assigned to the project**: the production domain (including `*.vercel.app`) must be assigned to the correct Vercel project/team; otherwise Vercel returns `NOT_FOUND`.
- **No production alias**: successful deployments can exist, but the “Production” alias may not point to the latest “Ready” deployment.

### What to verify in Vercel
- **Project → Settings → General → Root Directory**: set to `mok-car-rental`.
- **Project → Deployments**: confirm at least one deployment is “Ready” and marked “Production”.
- **Project → Domains**: confirm the failing domain is listed and shows “Valid Configuration”.

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

Admin credentials are configured via environment variables in production.

- **Email**: `ADMIN_EMAIL` (default: `admin@mokcarrental.com`)
- **Password**: use one of:
  - `ADMIN_PASSWORD` (stored encrypted at rest by your hosting provider)
  - `ADMIN_PASSWORD_SALT` + `ADMIN_PASSWORD_HASH` (+ optional `ADMIN_PASSWORD_ITERATIONS`) for PBKDF2 verification

## 🧯 Root Cause Analysis: Admin `net::ERR_ABORTED` / Chunk Fallback Loads

### Symptoms
- Browser console shows `net::ERR_ABORTED` when navigating to admin routes like `/admin/cars`.
- Some sessions also show fallback chunk requests and JSON parse errors (HTML returned where JSON was expected).

### Root Cause
- Admin navigation previously used hard reloads and client-only auth redirects (localStorage-based). When a redirect or full page reload happened mid-navigation, the browser aborted in-flight requests (page + Next.js chunks), surfacing as `net::ERR_ABORTED`.
- `/api/admin/audit-logs` was requested by the UI but did not exist, so Next.js returned an HTML 404 page and the client attempted `res.json()`, producing `Unexpected token '<'` errors.

### Permanent Fix
- Moved admin auth to a server-validated, cookie-based flow (login/logout/session endpoints + middleware redirects) to avoid mid-flight client redirects.
- Switched admin sidebar navigation to Next.js client routing (no full reloads).
- Added `/api/admin/audit-logs` endpoint and hardened the client fetch to safely handle non-JSON responses.

### Monitoring
- Server: middleware emits a structured `ADMIN_AUTH_REDIRECT` log when redirecting unauthenticated admin access.
- Client: `CLIENT_ERROR` logs are emitted via `/api/monitoring/client-error` for chunk/static load issues.

### Tests
- Unit + integration tests for admin routing, login cookie setting, and middleware redirects are in `__tests__/`.

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

## 🧩 Supabase Integration Architecture
- **Client (anon)**: `src/lib/supabase.ts` uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` for public reads and realtime subscriptions.
- **Server (service role)**: Next.js route handlers use `SUPABASE_SERVICE_ROLE_KEY` for all writes and admin operations (keeps RLS enabled and avoids client-side inserts/updates/deletes).
- **Customer inquiry writes**: `POST /api/inquiries` validates input, rate-limits by IP, writes to `inquiries`, and emits a realtime-safe event row in `inquiries_events`.
- **Admin writes**: `src/app/api/admin/**` uses the service role and requires an admin session cookie; clients redirect to `/admin/login` on 401.
- **Realtime**: Admin inquiries UI subscribes to `inquiries_events` (no PII) and refetches `/api/admin/inquiries` on change.

## 🌍 Environments (dev / staging / prod)
- Create separate Supabase projects for each environment and configure env vars per environment (local `.env.*` and Vercel environment variables).
- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Recommended env vars: `ADMIN_SESSION_SECRET` (signs admin cookie tokens), `SUPABASE_CAR_IMAGES_BUCKET`.

### cars
Stores all rental vehicles with specifications, pricing, and availability.

#### Troubleshooting: `Could not find the 'status' column of 'cars' in the schema cache`
- Ensure DB migrations are applied (especially `supabase/migrations/003_add_car_year_vin_status.sql`; hardening migration `supabase/migrations/009_cars_status_constraints.sql` is safe to apply too).
- If the column exists but the error persists, refresh PostgREST schema cache:
  - Admin API: `POST /api/admin/diagnostics/reload-schema` (requires an admin session cookie)
  - SQL editor: `NOTIFY pgrst, 'reload schema';`
  - RPC: `SELECT pgrst_reload_schema();` (service role)
  - If `pgrst_reload_schema` itself is missing in the schema cache, apply `supabase/migrations/006_execution_system.sql` first, then run the SQL editor `NOTIFY` once to make the function visible.

### inquiries
Stores customer booking inquiries with contact details and rental preferences.

### content_sections
Stores editable website content sections (CMS), including the “Why Choose” 6-item list.

#### Troubleshooting: `Could not find the table 'public.content_sections' in the schema cache`
- Ensure migrations are applied (especially `supabase/migrations/004_content_sections.sql` and `supabase/migrations/005_content_sections_items.sql`) or run the full schema from `supabase/schema.sql`.
- If the table exists but the error persists, refresh PostgREST schema cache in Supabase:
  - Run in Supabase SQL editor: `NOTIFY pgrst, 'reload schema';`
  - Then retry the request.

## 🔐 Secure Execution API (Trae-safe operations)

This project includes a server-side execution endpoint that only runs pre-defined operations within strict security boundaries.

### Endpoint
- `POST /api/execution`

### Authentication
- Requires `Authorization: Bearer <Supabase JWT>` (validated via Supabase Auth).

### Authorization (RBAC)
- Roles are stored in `public.user_roles` (migration `006_execution_system.sql`).
- Only roles explicitly allowed by an operation can run it.

### Rate limiting
- In-memory 30 requests/min per user (suitable for local/dev). For production, replace with a shared store (Redis).

### Built-in operations
- `supabase.reload_schema_cache` (calls `pgrst_reload_schema()` RPC)
- `content.why_choose.update_item` (updates one of the 6 “Why Choose” cards by icon key)

### Example request
```json
{
  "op": "content.why_choose.update_item",
  "input": {
    "icon": "truck",
    "title": "Airport Delivery",
    "description": "Convenient pickup and drop-off at Senai Airport."
  }
}
```

## 🖼️ Car Image Uploads (Supabase Storage)

### Storage bucket
- Create a Supabase Storage bucket named `car-images`
- Bucket can be Public (URLs will be used directly on the website)

### Database
- Apply migration `supabase/migrations/007_car_images.sql` (creates `car_images` table)

### Admin upload API
- `POST /api/admin/cars/:id/images` (multipart/form-data)
  - Field: `files` (multiple)
  - Validation: JPEG/PNG/WebP, max 10MB each, min 800×600
  - Processing: generates `thumb.webp` (200×200) and `medium.webp` (1024×768)
  - Persists metadata to `car_images` and updates `cars.image` + `cars.images` to the medium URLs for fast delivery
- `GET /api/admin/cars/:id/images` list images
- `DELETE /api/admin/cars/:id/images/:imageId` delete image

### Admin UI
- `/admin/cars` car modal includes drag/drop uploader and requires at least 3 images before finishing a new car listing.

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
