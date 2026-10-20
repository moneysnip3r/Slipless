// service-worker.js: makes the app installable and keeps the shell available offline.
//
// Strategy: network first, cache as the fallback. Online, users always get the
// latest files, so nobody is stuck on old code while we are still building.
// Offline, the last copy of each page and file is served from the cache.

// Change the number whenever you want every user's cache thrown away and rebuilt
const CACHE_NAME = "slipless-shell-v2";

// Files saved when the service worker installs
const SHELL_FILES = [
    "./",
    "index.html",
    "login.html",
    "signup.html",
    "tours_list.html",
    "settings.html",
    "style.css",
    "index.js",
    "login.js",
    "signup.js",
    "tours_list.js",
    "settings.js",
    "supabase-config.js",
    "supabase-client.js",
    "auth-guard.js",
    "manifest.json",
    "icons/icon-192.png",
    "icons/icon-512.png",
    "icons/icon-maskable-512.png",
    "icons/logo.png"
];

// Browsers refuse to use a response that came through a redirect to answer a
// page navigation. Hosts that redirect login.html to /login would trigger this,
// so this makes a clean copy of the response without the redirect flag.
async function cleanResponse(response) {
    if (!response.redirected) return response;
    const body = await response.blob();
    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    });
}

// Install: save the shell files.
// Each file is saved on its own, so one missing file (for example one that
// isn't created yet) doesn't stop the service worker from installing.
self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return Promise.allSettled(
                SHELL_FILES.map(function (file) {
                    return fetch(file)
                        .then(function (response) {
                            if (!response.ok) throw new Error(file + " not found");
                            return cleanResponse(response);
                        })
                        .then(function (clean) {
                            return cache.put(file, clean);
                        });
                })
            );
        }).then(function () {
            return self.skipWaiting(); // start using this version straight away
        })
    );
});

// Activate: delete caches from older versions
self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names
                    .filter(function (name) { return name !== CACHE_NAME; })
                    .map(function (name) { return caches.delete(name); })
            );
        }).then(function () {
            return self.clients.claim(); // take control of pages that are already open
        })
    );
});

// Fetch: runs for every request the app makes
self.addEventListener("fetch", function (event) {
    const request = event.request;
    const url = new URL(request.url);

    // Leave everything except plain same-site GET requests alone.
    // That keeps Supabase, Google sign-in and the Supabase library out of the cache.
    if (request.method !== "GET" || url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(request)
            .then(async function (response) {
                // Save a fresh copy of every good response for offline use
                if (response.ok) {
                    const copy = await cleanResponse(response.clone());
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, copy);
                }
                return response;
            })
            .catch(function () {
                // Offline: use the saved copy
                return caches.match(request, { ignoreSearch: true });
            })
    );
});