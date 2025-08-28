/**
 * Service Worker para Manychat Display
 * Responsável pelo cache de recursos e funcionamento offline
 */

const CACHE_NAME = 'manychat-display-v1';
const OFFLINE_URL = './offline.html';

// Lista de recursos para armazenar em cache
const RESOURCES_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './404.html',
  './site.webmanifest',
  './css/reset.css',
  './css/animations.css',
  './css/style.css',
  './js/main.js',
  './imagens/bg.svg',
  './imagens/plays/veja-quem-usa-manychat.png',
  './imagens/plays/case-camila-farani.png',
  './imagens/plays/case-galileu-nogueira.png',
  './imagens/plays/case-rafa-xavier.png',
  './imagens/plays/case-micha-menezes.png',
  './imagens/bg-footer.svg',
  './imagens/fullscreen.svg',
  './imagens/manychat-logo.svg',
  './imagens/quer-saber.png',
  './imagens/play.svg',
  './imagens/qr-code-rodape.png',
  './imagens/seta-voltar.svg',
  './imagens/voltar.svg',
  './imagens/rodape.png',

  // Vídeos (cacheados para funcionamento offline)
  './videos/HISTORIA-1-MICHA.mp4',
  './videos/HISTORIA-2-GALILEU.mp4',
  './videos/HISTORIA-3-RAFA.mp4',
  './videos/HISTORIA-4-CAMILA.mp4',
  './videos/VINHETA-1.mp4',
  './videos/VINHETA-2.mp4',
  './videos/VINHETA-3.mp4'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker instalando...');
  
  // Força o Service Worker a se tornar ativo imediatamente
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(RESOURCES_TO_CACHE);
      })
      .catch(error => {
        console.error('Falha ao armazenar recursos em cache:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker ativando...');
  
  // Limpa caches antigos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Permite que o Service Worker controle todas as guias abertas
  return self.clients.claim();
});

// Intercepta requisições
self.addEventListener('fetch', event => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') return;
  
  // Ignora requisições para outros domínios
  if (new URL(event.request.url).origin !== location.origin) return;
  
  // Estratégia: Cache com atualizações em segundo plano
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Retorna do cache se disponível
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Atualiza o cache com a nova resposta
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('Falha na requisição de rede:', error);
            
            // Se o recurso principal falhar, retorna a página offline
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            return null;
          });
        
        // Retorna do cache ou aguarda a rede
        return cachedResponse || fetchPromise;
      })
  );
});

// Sincronização em segundo plano (quando online novamente)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('Sincronizando dados em segundo plano');
    // Implementar lógica de sincronização se necessário
  }
});

// Recebimento de notificações push
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const notificationData = event.data.json();
  
  const options = {
    body: notificationData.body || 'Novidades da ManyChat!',
    icon: './imagens/manychat-logo.svg',
    badge: './imagens/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      url: notificationData.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'ManyChat', 
      options
    )
  );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(windowClients => {
        // Verificar se já há uma janela aberta e navegar para ela
        for (const client of windowClients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Se não houver janela aberta, abrir uma nova
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});