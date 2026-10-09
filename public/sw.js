/* AGCRIDES SW stub v1 — installable, no push in MVP. Bump version on deploy. */
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
