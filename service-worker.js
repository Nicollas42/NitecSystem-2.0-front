const cache_name = 'pdv_cache_v1';
const assets_to_cache = [
    '/frente-de-caixa',
    '/css/style.css',
    '/js/app.js',
    '/images/icon-192.png'
];

/**
 * Evento de instalação do Service Worker.
 * Cacheia os arquivos estáticos definidos.
 *
 * @param {ExtendableEvent} event
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cache_name).then((cache) => {
            return cache.addAll(assets_to_cache);
        })
    );
});

/**
 * Evento de ativação.
 * Limpa caches antigos se a versão mudar.
 *
 * @param {ExtendableEvent} event
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== cache_name).map((key) => caches.delete(key))
            );
        })
    );
});

/**
 * Intercepta requisições de rede (Fetch).
 * Estratégia: Stale-While-Revalidate (tenta cache, mas atualiza em background)
 * ou Network First para dados críticos. Aqui usaremos Cache First c/ fallback.
 *
 * @param {FetchEvent} event
 */
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached_response) => {
            // Retorna do cache se existir, senão vai para a rede
            return cached_response || fetch(event.request);
        })
    );
});