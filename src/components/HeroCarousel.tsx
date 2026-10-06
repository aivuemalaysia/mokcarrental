'use client';

// Home banner system (admin-controlled).
//
// Positions:
//   hero       -> top carousel strip
//   top        -> 1200x200 band under the trust icons
//   bottom     -> CTA band at the bottom of the page (arrow button optional)
//   popup      -> small pop-out overlay (triggered from its hero-strip slide, or admin-only)
//   fullscreen -> full-screen splash on first visit (session-gated)
//   offscreen  -> parked somewhere the user will not see; admin preview still works
//
// display_mode (on-tap behaviour for a hero/top/bottom strip):
//   none       -> tap does nothing
//   link       -> tap navigates to link_to
//   popup      -> tap opens a small pop-out
//   fullscreen -> tap opens the full-screen overlay

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export interface Banner {
  id: string;
  image_path: string | null;
  image_url: string | null;
  headline: string | null;
  sub: string | null;
  link_to: string | null;
  display_mode: 'none' | 'link' | 'popup' | 'fullscreen';
  sort_order: number;
  active: boolean;
  position: 'hero' | 'top' | 'bottom' | 'popup' | 'fullscreen' | 'offscreen';
  offscreen_x: string | null;
  offscreen_y: string | null;
  offscreen_w: string | null;
  offscreen_h: string | null;
  show_link_button: boolean;
  cta_label: string | null;
}

const PUBLIC_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zozlqhkrepcazavhwvtr.supabase.co';

export function bannerImageUrl(path?: string | null, url?: string | null) {
  if (url && url.startsWith('http')) return url;
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${PUBLIC_BASE}/storage/v1/object/public/vehicle-photos/${encodeURIComponent(path.replace(/^\/+/, ''))}`;
}

function offscreenStyle(b: Banner): React.CSSProperties | undefined {
  if (b.position !== 'offscreen') return undefined;
  return {
    position: 'fixed',
    left: b.offscreen_x || '9999px',
    top: b.offscreen_y || '9999px',
    width: b.offscreen_w || '300px',
    height: b.offscreen_h || '200px',
    zIndex: 0,
    pointerEvents: 'none',
    display: 'none',
  };
}

export default function HeroCarousel() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [active, setActive] = useState(0);
  const [overlay, setOverlay] = useState<'none' | 'popup' | 'fullscreen'>('none');
  const [splashVisible, setSplashVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const sb = supabase;
        const { data } = await sb
          .from('banners')
          .select('*')
          .eq('active', true)
          .order('sort_order, created_at');
        if (live) setBanners((data as Banner[]) || []);
      } catch {
        if (live) setBanners([]);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  const hero = useMemo(() => banners.filter((b) => b.position === 'hero'), [banners]);
  const top = useMemo(() => banners.filter((b) => b.position === 'top').slice(0, 1), [banners]);
  const bottom = useMemo(() => banners.filter((b) => b.position === 'bottom').slice(0, 1), [banners]);
  const popupOnly = useMemo(
    () => banners.filter((b) => b.position === 'popup').slice(0, 1),
    [banners]
  );
  const fullscreenOnly = useMemo(
    () => banners.filter((b) => b.position === 'fullscreen').slice(0, 1),
    [banners]
  );
  const offscreen = useMemo(
    () => banners.filter((b) => b.position === 'offscreen'),
    [banners]
  );

  const current = hero[active] ?? null;

  // Auto-slide hero strip.
  useEffect(() => {
    if (hero.length <= 1) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % hero.length), 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [hero.length]);

  const go = useCallback((i: number) => setActive((i + hero.length) % hero.length), [hero.length]);

  // Full-screen splash on first visit (session-gated), only for the first
  // 'fullscreen' position banner — NOT mixed into the hero strip.
  const splash = fullscreenOnly[0] ?? null;
  useEffect(() => {
    if (!splash) return;
    const key = 'mok_fs_splash_' + splash.id;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    setSplashVisible(true);
    const t = setTimeout(() => setSplashVisible(false), 4000);
    return () => clearTimeout(t);
  }, [splash]);

  function slideTap(b: Banner) {
    const mode = b.display_mode || 'none';
    if (mode === 'popup') setOverlay('popup');
    else if (mode === 'fullscreen') setOverlay('fullscreen');
    else if (mode === 'link' && b.link_to) router.push(b.link_to);
  }

  const topBanner = top[0];
  const bottomBanner = bottom[0];
  const popupBanner = popupOnly[0] ?? current;
  const fsBanner = fullscreenOnly[0] ?? current;

  return (
    <>
      {/* ============ HERO STRIP (top) ============ */}
      {hero.length > 0 && (
        <section className="relative h-[400px] overflow-hidden text-white select-none">
          {hero.map((b, i) => (
            <div
              key={b.id}
              className={
                'absolute inset-0 transition-opacity duration-700 cursor-pointer ' +
                (i === active ? 'opacity-100' : 'opacity-0')
              }
              onClick={() => i === active && slideTap(b)}
            >
              {bannerImageUrl(b.image_path, b.image_url) ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${bannerImageUrl(b.image_path, b.image_url)}')` }}
                />
              ) : (
                <div className="absolute inset-0 bg-[#0B0B0D]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-[#0B0B0D]" />
              <div className="relative z-10 mt-24 px-5">
                <h1 className="text-[40px] font-black italic leading-[0.92] tracking-tight">
                  {b.headline || 'DRIVE YOUR WAY'}
                </h1>
                <div className="mt-1.5 h-[3px] w-20 rounded-full bg-[#D51F2B]" />
                <p className="mt-3 text-[10px] font-semibold tracking-[0.22em] text-white/75">
                  {b.sub || 'CAR RENTAL · JB · SENAI · SINGAPORE'}
                </p>
              </div>
            </div>
          ))}
          {hero.length > 1 && (
            <>
              <button
                aria-label="Previous banner"
                onClick={(e) => {
                  e.stopPropagation();
                  go(active - 1);
                }}
                className="absolute left-2 top-[46%] z-20 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center"
              >
                ‹
              </button>
              <button
                aria-label="Next banner"
                onClick={(e) => {
                  e.stopPropagation();
                  go(active + 1);
                }}
                className="absolute right-2 top-[46%] z-20 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center"
              >
                ›
              </button>
              <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center gap-2">
                {hero.map((b, i) => (
                  <button
                    key={b.id}
                    aria-label={`Banner ${i + 1}`}
                    onClick={() => go(i)}
                    className={'h-1.5 rounded-full transition-all ' + (i === active ? 'w-6 bg-[#D51F2B]' : 'w-1.5 bg-white/50')}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* ============ TOP BAND (1200 x 200, under trust icons) ============ */}
      {topBanner && (
        <section
          className="relative mt-4 w-full overflow-hidden"
          style={{ minHeight: 160 }}
          onClick={() => slideTap(topBanner)}
        >
          {bannerImageUrl(topBanner.image_path, topBanner.image_url) ? (
            <img
              src={bannerImageUrl(topBanner.image_path, topBanner.image_url)}
              alt={topBanner.headline || 'banner'}
              className="w-full h-[160px] object-cover"
            />
          ) : (
            <div className="w-full h-[160px] bg-[#0B0B0D] flex items-center justify-center text-white text-[16px] font-bold">
              {topBanner.headline}
            </div>
          )}
          {topBanner.headline && (
            <div className="absolute bottom-3 left-0 right-0 px-5 text-white">
              <p className="text-[18px] font-extrabold italic">{topBanner.headline}</p>
              {topBanner.sub && <p className="text-[11px] text-white/80 mt-0.5">{topBanner.sub}</p>}
            </div>
          )}
        </section>
      )}

      {/* ============ BOTTOM CTA BAND ============ */}
      {bottomBanner ? (
        <section className="relative mt-6 px-4 pb-8">
          <div
            className="relative w-full overflow-hidden rounded-2xl"
            onClick={() => bottomBanner.display_mode === 'link' && bottomBanner.link_to && router.push(bottomBanner.link_to)}
          >
            {bannerImageUrl(bottomBanner.image_path, bottomBanner.image_url) ? (
              <img
                src={bannerImageUrl(bottomBanner.image_path, bottomBanner.image_url)}
                alt={bottomBanner.headline || 'cta'}
                className="w-full h-[180px] object-cover"
              />
            ) : (
              <div className="w-full h-[180px] bg-gradient-to-r from-[#0B0B0D] to-[#2a0a0a] flex items-center p-6 text-white">
                <div className="text-[22px] font-black">{bottomBanner.headline}</div>
              </div>
            )}
            {bottomBanner.headline && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent p-6 flex flex-col justify-end">
                <p className="text-white text-[20px] font-black leading-tight">{bottomBanner.headline}</p>
                {bottomBanner.sub && <p className="text-white/80 text-[12px] mt-1">{bottomBanner.sub}</p>}
              </div>
            )}
            {bottomBanner.show_link_button !== false && bottomBanner.link_to && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(bottomBanner.link_to!);
                }}
                className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-[#D51F2B] text-white flex items-center justify-center shadow-lg"
                aria-label="Go"
              >
                →
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-6 px-4 pb-8">
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#0B0B0D] to-[#2a0a0a] p-5 text-white">
            <div>
              <div className="text-[9px] font-semibold tracking-[0.2em] text-white/45">
                TRAVEL · BUSINESS · FAMILY · LEISURE
              </div>
              <div className="mt-1 text-xl font-black leading-tight">
                BOOK NOW
                <br />
                DRIVE HAPPIER
              </div>
            </div>
            <Link
              href="/cars"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D51F2B] text-white shadow-lg"
              aria-label="Browse cars"
            >
              →
            </Link>
          </div>
        </section>
      )}

      {/* ============ POP-OUT OVERLAY (separate from hero) ============ */}
      {overlay === 'popup' && popupBanner && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-6"
          onClick={() => setOverlay('none')}
        >
          <div
            className="relative max-w-[440px] w-full rounded-[16px] overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={bannerImageUrl(popupBanner.image_path, popupBanner.image_url)}
              alt={popupBanner.headline || ''}
              className="w-full h-[320px] object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
              <p className="text-[18px] font-extrabold italic leading-tight">{popupBanner.headline}</p>
              {popupBanner.sub && <p className="mt-1 text-[11px] text-white/80">{popupBanner.sub}</p>}
              {popupBanner.link_to && (
                <button
                  onClick={() => {
                    setOverlay('none');
                    router.push(popupBanner.link_to!);
                  }}
                  className="mt-3 bg-[#D51F2B] text-white text-[12px] font-bold px-4 py-2 rounded-[10px]"
                >
                </button>
              )}
            </div>
            <button
              aria-label="Close"
              onClick={() => setOverlay('none')}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ============ FULL-SCREEN OVERLAY (separate from hero) ============ */}
      {overlay === 'fullscreen' && fsBanner && (
        <div className="fixed inset-0 z-[210] bg-black" onClick={() => setOverlay('none')}>
          <img
            src={bannerImageUrl(fsBanner.image_path, fsBanner.image_url)}
            alt={fsBanner.headline || ''}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/85 to-transparent text-white">
            <p className="text-[28px] font-black italic leading-tight">{fsBanner.headline}</p>
            {fsBanner.sub && <p className="mt-1 text-[12px] text-white/80">{fsBanner.sub}</p>}
            {fsBanner.link_to && (
              <button
                onClick={() => {
                  setOverlay('none');
                  router.push(fsBanner.link_to!);
                }}
                className="mt-4 bg-[#D51F2B] text-white text-[13px] font-bold px-5 py-2.5 rounded-[10px]"
              >
                Continue
              </button>
            )}
          </div>
          <button
            aria-label="Close"
            onClick={() => setOverlay('none')}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white text-[16px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* ============ FULL-SCREEN SPLASH (first visit only) ============ */}
      {splashVisible && splash && (
        <div className="fixed inset-0 z-[300] bg-black">
          <img
            src={bannerImageUrl(splash.image_path, splash.image_url)}
            alt={splash.headline || ''}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/85 to-transparent text-white">
            <p className="text-[28px] font-black italic leading-tight">{splash.headline}</p>
            {splash.sub && <p className="mt-1 text-[12px] text-white/80">{splash.sub}</p>}
          </div>
          <button
            aria-label="Skip"
            onClick={() => setSplashVisible(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white text-[14px]"
          >
            Skip ×
          </button>
        </div>
      )}

      {/* ============ OFFSCREEN (admin preview only, invisible to users) ============ */}
      {offscreen.map((b) => (
        <div key={b.id} style={offscreenStyle(b)}>
          <img src={bannerImageUrl(b.image_path, b.image_url)} alt={b.headline || ''} className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Hidden placeholder so an empty hero area does not collapse layout */}
      {hero.length === 0 && (
        <section className="relative h-[400px] overflow-hidden text-white">
          <div className="absolute inset-0 bg-[#0B0B0D]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-[#0B0B0D]" />
          <div className="relative z-10 mt-24 px-5">
            <h1 className="text-[40px] font-black italic leading-[0.92] tracking-tight">
              DRIVE
              <br />
              YOUR WAY
            </h1>
            <div className="mt-1.5 h-[3px] w-20 rounded-full bg-[#D51F2B]" />
            <p className="mt-3 text-[10px] font-semibold tracking-[0.22em] text-white/75">
              CAR RENTAL · JB · SENAI · SINGAPORE
            </p>
          </div>
        </section>
      )}
    </>
  );
}

