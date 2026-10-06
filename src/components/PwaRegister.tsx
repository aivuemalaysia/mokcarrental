'use client';

import { useEffect, useRef, useState } from 'react';

// `beforeinstallprompt` is a non-standard event; cast the native event to it.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export default function PwaRegister() {
  const [showInstall, setShowInstall] = useState(false);
  const [showPromos, setShowPromos] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [promosActive, setPromosActive] = useState(false);
  const installEventRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Don't show on admin pages.
    if (window.location.pathname.startsWith('/admin')) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      installEventRef.current = e as BeforeInstallPromptEvent;
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const onInstalled = () => {
      setShowInstall(false);
      setPromosActive(true);
      setShowPromos(false);
    };
    window.addEventListener('appinstalled', onInstalled);

    // Offer a promos opt-in a little after load (only if it is not dismissed).
    const t = setTimeout(() => {
      setShowPromos(true);
    }, 3500);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(t);
    };
  }, []);

  const handleInstall = async () => {
    const ev = installEventRef.current;
    if (!ev) return;
    await ev.prompt();
    setShowInstall(false);
  };

  const handlePromos = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      // Stub: no push server yet. When a push provider (e.g. web-push) is
      // added, call serviceWorker.pushManager.subscribe() and store the
      // endpoint server-side so promos can actually be sent later.
      console.info('Mok PWA: promo push opt-in granted');
      setPromosActive(true);
    }
    setShowPromos(false);
  };

  if (dismissed) return null;

  // If promos are active, show a subtle "promos on" indicator instead.
  if (promosActive && !showPromos) {
    return (
      <div className="fixed bottom-24 right-4 z-40 text-xs text-gray-400 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow">
        Promo updates: on
      </div>
    );
  }

  if (!showInstall && !showPromos) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {showInstall && (
        <button
          onClick={handleInstall}
          className="bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <span aria-hidden>&#8595;</span> Install app
        </button>
      )}

      {showPromos && (
        <button
          onClick={handlePromos}
          className="bg-gold-500 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:bg-gold-600 transition-colors"
        >
          Get promos
        </button>
      )}

      {(showInstall || showPromos) && (
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-gray-400 hover:text-gray-600 text-xs px-2"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
