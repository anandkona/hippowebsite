// Service Worker for Chat Notifications
const CACHE_NAME = 'hippo-chat-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag } = event.data;

    event.waitUntil(
      self.registration.showNotification(title || 'Hippo Cloud', {
        body: body || 'You have a new message',
        icon: icon || '/Hippo_Logo.png',
        badge: '/Hippo_Logo.png',
        tag: tag || 'hippo-chat-notification',
        renotify: true,
        vibrate: [200, 100, 200],
      })
    );
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
