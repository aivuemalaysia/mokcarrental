'use client';

import { useEffect, useRef } from 'react';

export default function ClientErrorMonitor() {
  const lastSentAt = useRef(0);

  useEffect(() => {
    const send = (type: string, message: string) => {
      const now = Date.now();
      if (now - lastSentAt.current < 10_000) return;
      lastSentAt.current = now;

      const payload = JSON.stringify({
        type,
        message,
        href: window.location.href,
      });

      fetch('/api/monitoring/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    };

    const onError = (event: Event) => {
      const anyEvent = event as any;
      const message = typeof anyEvent?.message === 'string' ? anyEvent.message : '';
      const errorName = typeof anyEvent?.error?.name === 'string' ? anyEvent.error.name : '';
      const targetSrc = typeof anyEvent?.target?.src === 'string' ? anyEvent.target.src : '';

      if (errorName === 'ChunkLoadError' || message.includes('Loading chunk')) {
        send('chunk_load', message || errorName);
        return;
      }

      if (targetSrc.includes('/_next/static/')) {
        send('next_static_load', targetSrc);
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason?.message === 'string' ? reason.message : String(reason);
      if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
        send('chunk_load', message);
      }
    };

    window.addEventListener('error', onError, true);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError, true);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}

