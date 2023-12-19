const einmaleins = "einmaleins-v4"
const assets = [
  "./index.html",
  "./style.css",
  "./ui.js",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(einmaleins).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  })
  