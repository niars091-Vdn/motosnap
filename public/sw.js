// ═══════════════════════════════════════════════
// MotoSnap Service Worker — Push Notifications
// ═══════════════════════════════════════════════

const CACHE_NAME = 'motosnap-v1'
const OFFLINE_URL = '/offline.html'

// ── Install: cache offline page
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([OFFLINE_URL, '/', '/manifest.json']))
  )
  self.skipWaiting()
})

// ── Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: serve from cache when offline
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(OFFLINE_URL))
    )
  }
})

// ══════════════════════════════════════
// PUSH — riceve la notifica dal server
// ══════════════════════════════════════
self.addEventListener('push', e => {
  if (!e.data) return

  let data = {}
  try { data = e.data.json() } catch { data = { title: 'MotoSnap', body: e.data.text() } }

  const {
    title   = 'MotoSnap 🏍️',
    body    = '',
    icon    = '/icons/icon-192.png',
    badge   = '/icons/icon-96.png',
    image   = null,
    url     = '/',
    type    = 'generic',  // 'offer' | 'maint' | 'news' | 'generic'
    tag     = type,
    price   = null,
  } = data

  // Emoji e colori per tipo
  const typeConfig = {
    offer:   { emoji: '💰', color: '#2a7a40' },
    maint:   { emoji: '🔧', color: '#e67020' },
    news:    { emoji: '📰', color: '#3a7bd5' },
    generic: { emoji: '🏍️', color: '#2a6644' },
  }
  const cfg = typeConfig[type] || typeConfig.generic

  const options = {
    body:    price ? `${body}\n${cfg.emoji} ${price}` : body,
    icon,
    badge,
    image,
    tag,                    // collassa notifiche dello stesso tipo
    renotify: false,
    requireInteraction: type === 'maint',  // manutenzione rimane fino al click
    silent: false,
    vibrate: [100, 50, 100],
    data: { url, type },
    actions: type === 'offer' ? [
      { action: 'open',    title: '🛍️ Vedi offerta' },
      { action: 'dismiss', title: 'Ignora' },
    ] : type === 'maint' ? [
      { action: 'open',    title: '🔧 Vai al garage' },
      { action: 'dismiss', title: 'Ricordamelo dopo' },
    ] : [],
  }

  e.waitUntil(self.registration.showNotification(title, options))
})

// ══════════════════════════════════════
// CLICK sulla notifica
// ══════════════════════════════════════
self.addEventListener('notificationclick', e => {
  e.notification.close()

  const url = e.notification.data?.url || '/'
  const action = e.action

  if (action === 'dismiss') return

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Se l'app è già aperta, portala in primo piano
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.postMessage({ type: 'NOTIFICATION_CLICK', url })
          return
        }
      }
      // Altrimenti apri una nuova finestra
      return clients.openWindow(url)
    })
  )
})

// ══════════════════════════════════════
// PUSH SUBSCRIPTION CHANGE
// (quando il browser rinnova la sottoscrizione)
// ══════════════════════════════════════
self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil(
    fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: e.newSubscription?.toJSON(),
        old_endpoint: e.oldSubscription?.endpoint,
      }),
    })
  )
})
