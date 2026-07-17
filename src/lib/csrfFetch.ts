// src/lib/csrfFetch.ts - CSRF-aware fetch wrapper for admin API calls

let cachedCsrfToken: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  // Return cached token if available and not expired
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }
  
  // If a fetch is already in progress, reuse it
  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }
  
  tokenFetchPromise = (async () => {
    try {
      const res = await fetch('/api/admin/session', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) return '';
      const json = await res.json().catch(() => null);
      const token = json?.data?.csrfToken || '';
      if (token) {
        cachedCsrfToken = token;
      }
      return token;
    } catch {
      return '';
    } finally {
      tokenFetchPromise = null;
    }
  })();
  
  return tokenFetchPromise;
}

export async function csrfFetch(url: string, options: RequestInit & { body?: any } = {}) {
  const { headers: initHeaders, body, ...rest } = options;
  
  // Build headers
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(initHeaders instanceof Headers ? Object.fromEntries(initHeaders.entries()) : (initHeaders as Record<string, string>)),
  };
  
  // Auto-fetch and attach CSRF token for mutating methods
  const method = (rest.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    const token = await fetchCsrfToken();
    if (token) {
      finalHeaders['x-csrf-token'] = token;
    }
  }
  
  const bodyToSend = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined;

  return fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: bodyToSend,
  });
}

// Reset the cached token (call after login/logout)
export function resetCsrfToken(): void {
  cachedCsrfToken = null;
  tokenFetchPromise = null;
}
