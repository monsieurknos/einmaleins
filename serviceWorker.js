const einmaleins = "einmaleins-v6"
const assets = [
  "index.html",
  "style.css",
  "ui.js",
  "bg.jpg",
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
        console.log("Cleared cacheName "+cacheName);
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
        // cache first is ok, but store in cache on reloads!
        if (res && self.upToDate) return res;
        
        // see https://stackoverflow.com/questions/33262385/service-worker-force-update-of-new-assets
        //  return res || fetch(fetchEvent.request)
        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response
        var fetchRequest = fetchEvent.request.clone();
        let url = fetchEvent.request.url;

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic' || url.substring(0,8)!=="https://") {
              return response;
            }
            // Check if we cache this resource at all (still bogous)
            if (assets.every((a)=>!url.endsWith(a))) {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have 2 stream.
            var responseToCache = response.clone();

            caches.open(einmaleins)
              .then(function(cache) {
                cache.put(fetchEvent.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
  });
  