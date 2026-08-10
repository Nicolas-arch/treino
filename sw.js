/* Service worker — offline + atualização automática
   Estratégia: rede primeiro, cache como reserva.
   Assim o app sempre pega a versão nova quando há internet,
   e continua funcionando na academia quando não há sinal. */
const CACHE = "treino-nicolas-v2";
const ARQUIVOS = ["./", "./index.html", "./sw.js"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())   // assume o controle na hora
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(hit => hit || caches.match("./index.html"))
      )
  );
});
