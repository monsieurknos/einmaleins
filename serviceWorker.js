// Version 2024-03-08 
const einmaleins = "einmaleins"
const assets = [
  "index.html",
  "style.css",
  "ui.js",
  "img/bg.jpg",
  "img/copy.svg",
  "img/qrcode.svg",
  "img/teilen.svg",
  "img/threema-icon.svg",
  "img/whatsapp.svg",
  "ogg/2.ogg",
  "ogg/3.ogg",
  "ogg/4.ogg",
  "ogg/5.ogg",
  "ogg/6.ogg",
  "ogg/7.ogg",
  "ogg/8.ogg",
  "ogg/9.ogg",
  "ogg/10.ogg",
  "ogg/mal.ogg",
]


async function populateCache() {
  self.upToDate = false;
  try {
    const cache = await caches.open(einmaleins);
    const total = assets.length;
    let installed = 0;

    await Promise.all(assets.map(async (url) => {
      let controller;
      try {
        controller = new AbortController();
        const { signal } = controller;
        // the cache option set to reload will force the browser to
        // request any of these resources via the network,
        // which avoids caching older files again
        const req = new Request(url, { cache: 'reload' });
        const res = await fetch(req, { signal });

        if (res && res.status === 200) {
          await cache.put(req, res.clone());
          installed += 1;
        } else {
          console.info(`unable to fetch ${url} (${res.status})`);
        }
      } catch (e) {
        console.info(`unable to fetch ${url}, ${e.message}`);
        // abort request in any case
        controller.abort();
      }
    }));

    if (installed === total) {
      console.info(`Cache populated with (${installed}/${total} files)`);
      self.upToDate = true;
    } else {
      console.info(`cache partially populated with (${installed}/${total} files)`);
    }
  } catch (e) {
    console.error(`unable to populate cache, ${e.message}`);
  }
}

// remove old cache if any
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(async (cacheName) => {
      if (einmaleins !== cacheName) {
        console.log("Cleared cacheName " + cacheName);
        await caches.delete(cacheName);
      }
    }));
  })());
});

self.addEventListener("install", installEvent => {
  // from https://stackoverflow.com/questions/33262385/service-worker-force-update-of-new-assets
  self.skipWaiting();
  console.log("Installing app...");
  installEvent.waitUntil(populateCache());

});

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      if (res) return res;
      return fetch(fetchEvent.request);
    })
  )
});
