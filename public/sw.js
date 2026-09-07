/* Boutique service worker — offline app shell + graceful fallback. */
const CACHE = "boutique-v5";
const PRECACHE = ["/", "/offline", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Only handle GET; never cache API, auth, or admin requests.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/admin")) return;

  /**
   * Only successful, same-origin, non-partial responses may be stored.
   *
   * Without this check an error response gets cached like any other — and for
   * cache-first assets that is permanent: a product image that failed once (a
   * host not yet allow-listed, a deploy in flight) would keep being served from
   * cache as a failure long after the server had recovered.
   */
  const store = (req, res) => {
    if (!res || !res.ok || res.status !== 200 || res.type === "opaque") return res;
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
    return res;
  };

  // Navigations: network-first, fall back to cache then the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => store(request, res))
        .catch(() => caches.match(request).then((r) => r || caches.match("/offline"))),
    );
    return;
  }

  // Static assets: cache-first, but refresh the entry in the background so a
  // stale or since-corrected asset heals itself on the next visit.
  if (["style", "script", "image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => store(request, res))
          .catch(() => cached);
        if (cached) {
          event.waitUntil(network);
          return cached;
        }
        return network;
      }),
    );
  }
});
