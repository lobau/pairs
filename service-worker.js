// service-worker.js
// listen to the install event

var staticCacheName = "fənetik";

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(staticCacheName).then(function (cache) {
      console.log("ServiceWorker installed");
      return cache.addAll(["/"]);
    })
  );
});

self.addEventListener("fetch", function (event) {
  console.log(event.request.url);

  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      if (event.action === "snooze") {
        // TODO: Snooze notification
      } else if(event.action === "open") {
        if (clients.length) {
          // check if at least one tab is already open
          clients[0].focus();
        } else {
          self.clients.openWindow("/");
        }
      }
    })
  );
});
