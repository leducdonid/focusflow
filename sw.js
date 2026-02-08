// ============================================================
// FocusFlow Service Worker v1.0.0
// Cache-first for app shell, network-first for API, offline fallback
// ============================================================

const CACHE_VERSION = 'focusflow-v3';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_FONTS = `${CACHE_VERSION}-fonts`;

// App shell files - cache these on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/modules/onboarding.js',
  '/modules/onboarding.css',
  '/modules/streaks.js',
  '/modules/achievements.js',
  '/modules/gamification.css',
  '/modules/sounds.js',
  '/modules/sounds.css',
  '/modules/sharing.js',
  '/modules/sharing.css',
  '/modules/reflection.js',
  '/modules/supabase-config.js',
  '/modules/auth.js',
  '/modules/auth.css',
  '/modules/sync.js',
];

// External resources to pre-cache
const EXTERNAL_CACHE = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
];

// Max age for dynamic cache entries (7 days)
const DYNAMIC_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Max number of entries in dynamic cache
const DYNAMIC_CACHE_MAX_ITEMS = 50;

// Offline fallback HTML
const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>FocusFlow — Offline</title>
  <meta name="theme-color" content="#0a0f0d">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #0a0f0d;
      color: #f2ede4;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .offline-container {
      text-align: center;
      max-width: 420px;
    }
    .offline-icon {
      font-size: 64px;
      margin-bottom: 24px;
      display: block;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #d4b872;
    }
    p {
      color: #b8b3aa;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .retry-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      background: #d4b872;
      color: #0a0f0d;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .retry-btn:hover { opacity: 0.85; }
    .tip {
      margin-top: 32px;
      padding: 16px;
      background: #111916;
      border-radius: 10px;
      border: 1px solid #2d3b33;
    }
    .tip p { margin-bottom: 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="offline-container">
    <span class="offline-icon">📡</span>
    <h1>Ban dang offline</h1>
    <p>Khong the ket noi internet. FocusFlow can ket noi de tai lai trang.</p>
    <button class="retry-btn" onclick="window.location.reload()">
      🔄 Thu lai
    </button>
    <div class="tip">
      <p>💡 Meo: Du lieu cua ban van duoc luu tru an toan tren thiet bi. Khi co mang tro lai, moi thu se hoat dong binh thuong.</p>
    </div>
  </div>
</body>
</html>
`;

// ============================================================
// INSTALL: Pre-cache app shell
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // Cache app shell files
      const staticCache = await caches.open(CACHE_STATIC);
      await staticCache.addAll(APP_SHELL);

      // Cache fonts separately (they rarely change)
      const fontsCache = await caches.open(CACHE_FONTS);
      for (const url of EXTERNAL_CACHE) {
        try {
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) {
            await fontsCache.put(url, response);
          }
        } catch (err) {
          console.warn('[SW] Failed to cache external resource:', url, err);
        }
      }

      // Store offline fallback page in static cache
      const offlineResponse = new Response(OFFLINE_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
      await staticCache.put('/offline.html', offlineResponse);

      // Skip waiting to activate immediately
      self.skipWaiting();
    })()
  );
});

// ============================================================
// ACTIVATE: Clean up old caches
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete caches that don't match current version
      const cacheNames = await caches.keys();
      const deletions = cacheNames
        .filter((name) => {
          // Keep caches that start with our version prefix
          return !name.startsWith(CACHE_VERSION);
        })
        .map((name) => {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        });

      await Promise.all(deletions);

      // Take control of all clients immediately
      await self.clients.claim();

      // Notify all clients about the update
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: CACHE_VERSION,
        });
      });
    })()
  );
});

// ============================================================
// FETCH: Routing strategies
// ============================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // CRITICAL: Never cache Supabase API calls
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(request));
    return;
  }

  // Route: Google Fonts CSS -> Cache first with network fallback
  if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(cacheFirstWithNetworkFallback(request, CACHE_FONTS));
    return;
  }

  // Route: Google Fonts files (woff2, etc.) -> Cache first (fonts are immutable)
  if (url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirstWithNetworkFallback(request, CACHE_FONTS));
    return;
  }

  // Route: App shell (same origin, navigation or known files) -> Cache first
  if (url.origin === self.location.origin) {
    // Navigation requests (HTML pages)
    if (request.mode === 'navigate') {
      event.respondWith(networkFirstWithCacheFallback(request, CACHE_STATIC));
      return;
    }

    // Known app shell files -> Cache first
    const pathname = url.pathname;
    if (isAppShellFile(pathname)) {
      event.respondWith(cacheFirstWithRevalidate(request, CACHE_STATIC));
      return;
    }

    // Icon files and other static assets -> Cache first
    if (pathname.startsWith('/icons/') || pathname.endsWith('.svg') || pathname.endsWith('.png')) {
      event.respondWith(cacheFirstWithNetworkFallback(request, CACHE_STATIC));
      return;
    }

    // Everything else from same origin -> Network first
    event.respondWith(networkFirstWithCacheFallback(request, CACHE_DYNAMIC));
    return;
  }

  // Route: External API calls -> Network first
  event.respondWith(networkFirstWithCacheFallback(request, CACHE_DYNAMIC));
});

// ============================================================
// CACHING STRATEGIES
// ============================================================

/**
 * Cache First with Network Fallback
 * Best for: fonts, icons, rarely-changing resources
 */
async function cacheFirstWithNetworkFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // If it's a navigation request, return offline page
    if (request.mode === 'navigate') {
      return getOfflinePage();
    }
    return new Response('Network error', { status: 408, statusText: 'Network error' });
  }
}

/**
 * Cache First with Background Revalidation (Stale-While-Revalidate)
 * Best for: app shell files (CSS, JS) - serve fast, update in background
 */
async function cacheFirstWithRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Background revalidation - fetch fresh copy and update cache
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());

        // If the content has changed and we served a cached version,
        // notify the client that an update is available
        if (cached) {
          checkForContentChange(cached, networkResponse.clone());
        }
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, ignore for background revalidation
    });

  // Return cached version immediately, or wait for network
  if (cached) {
    return cached;
  }

  // No cache, must wait for network
  try {
    const response = await fetchPromise;
    if (response) return response;
  } catch (err) {
    // pass through
  }

  return getOfflinePage();
}

/**
 * Network First with Cache Fallback
 * Best for: HTML pages, dynamic content
 */
async function networkFirstWithCacheFallback(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Don't cache opaque responses in dynamic cache
      cache.put(request, networkResponse.clone());
      trimCache(cacheName, DYNAMIC_CACHE_MAX_ITEMS);
    }

    return networkResponse;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    // Navigation request -> offline page
    if (request.mode === 'navigate') {
      return getOfflinePage();
    }

    return new Response('Network error', { status: 408, statusText: 'Network error' });
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function isAppShellFile(pathname) {
  const shellPaths = ['/', '/index.html', '/styles.css', '/app.js', '/manifest.json'];
  if (shellPaths.includes(pathname)) return true;
  if (pathname.startsWith('/modules/')) return true;
  return false;
}

async function getOfflinePage() {
  const cache = await caches.open(CACHE_STATIC);
  const offlineCached = await cache.match('/offline.html');
  if (offlineCached) {
    return offlineCached;
  }

  // Fallback: generate inline offline page
  return new Response(OFFLINE_PAGE, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/**
 * Check if content has changed between cached and fresh versions
 */
async function checkForContentChange(cachedResponse, freshResponse) {
  try {
    const cachedText = await cachedResponse.text();
    const freshText = await freshResponse.text();

    if (cachedText !== freshText) {
      // Content changed, notify clients
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_UPDATE_AVAILABLE',
          version: CACHE_VERSION,
        });
      });
    }
  } catch (err) {
    // Ignore comparison errors
  }
}

/**
 * Trim cache to keep it under a maximum number of items
 */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    // Delete oldest entries (first in, first out)
    const deleteCount = keys.length - maxItems;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// ============================================================
// MESSAGE HANDLING: Communication with main thread
// ============================================================
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_VERSION':
      event.source.postMessage({
        type: 'SW_VERSION',
        version: CACHE_VERSION,
      });
      break;

    case 'CLEAR_CACHES':
      (async () => {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        event.source.postMessage({ type: 'CACHES_CLEARED' });
      })();
      break;

    case 'CACHE_URLS':
      if (payload && Array.isArray(payload.urls)) {
        (async () => {
          const cache = await caches.open(CACHE_DYNAMIC);
          for (const url of payload.urls) {
            try {
              const response = await fetch(url);
              if (response.ok) {
                await cache.put(url, response);
              }
            } catch (err) {
              console.warn('[SW] Failed to cache URL:', url);
            }
          }
          event.source.postMessage({ type: 'URLS_CACHED' });
        })();
      }
      break;
  }
});

// ============================================================
// BACKGROUND SYNC: Retry failed operations when back online
// ============================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'focusflow-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Read pending sync operations from IndexedDB or a sync queue
  // For now, this notifies clients they're back online
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
    });
  });
}

// ============================================================
// PERIODIC BACKGROUND SYNC (if supported)
// ============================================================
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'focusflow-periodic-sync') {
    event.waitUntil(handlePeriodicSync());
  }
});

async function handlePeriodicSync() {
  // Re-cache app shell in background
  try {
    const cache = await caches.open(CACHE_STATIC);
    await cache.addAll(APP_SHELL);
  } catch (err) {
    console.warn('[SW] Periodic sync cache update failed:', err);
  }
}

// ============================================================
// PUSH NOTIFICATIONS (placeholder for future use)
// ============================================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'FocusFlow notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'focusflow-notification',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(data.title || 'FocusFlow', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus an existing window if one exists
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(url);
    })
  );
});
