const CACHE_VERSION = 'mamabuddy-v21';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

const SHELL_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.add(SHELL_URL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

function isApiRequest(url) {
  const isSupabase = url.hostname.endsWith('supabase.co');
  const isVercelApi = url.hostname.endsWith('vercel.app') && url.pathname.startsWith('/api/');
  return isSupabase || isVercelApi;
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    /\.(png|jpg|jpeg|svg|webp|woff2?|ico)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nooit Supabase/API-calls cachen — altijd verse, persoonlijke data.
  if (isApiRequest(url)) return;

  // Statische assets: cache-first (Vite fingerprint't bestandsnamen, dus veilig).
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Navigatie/app-shell: network-first met offline-fallback naar de gecachte shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(SHELL_CACHE).then((cache) => cache.put(SHELL_URL, response.clone()));
          return response;
        })
        .catch(() => caches.match(SHELL_URL)),
    );
  }
});
