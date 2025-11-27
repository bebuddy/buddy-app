// public/custom-sw.js

// next-pwa에 의해 자동 생성된 기본 Service Worker 로직을 가져옵니다.
// 이 코드가 없으면 next-pwa의 캐싱/오프라인 기능이 작동하지 않을 수 있습니다.
// 참고: next-pwa 버전 및 설정에 따라 importScripts의 경로가 달라질 수 있습니다.
importScripts('./workbox-sw.js');
importScripts('./workbox-core.js');

// next-pwa의 workbox 경로가 public 폴더 내에 있다고 가정하고,
// next-pwa가 생성한 기본 Service Worker를 import합니다.
try {
  // @ts-ignore
  self.importScripts('/sw.js');
} catch (e) {
  console.error("Failed to import next-pwa's sw.js", e);
}


// --- 푸시 알림 수신 로직 ---

// 💡 'push' 이벤트 리스너
self.addEventListener('push', function (event) {
  // 서버에서 보낸 페이로드(데이터)를 가져옵니다.
  const data = event.data ? event.data.json() : {};
  console.log('[Service Worker] Push Received.', data);

  // 알림에 표시할 title과 options를 정의합니다.
  const title = data.title || '새 알림';
  const options = {
    body: data.body || '새로운 알림이 도착했습니다.',
    icon: data.icon || '/icons/icon-192x192.png', // 알림에 표시할 아이콘
    badge: data.badge || '/icons/icon-72x72.png', // 안드로이드 알림 창의 작은 아이콘
    vibrate: [200, 100, 200],
    data: { // 알림 클릭 시 사용할 추가 데이터
      url: data.actionUrl || '/', // 클릭 시 이동할 URL
      notificationId: data.notificationId, // 서버에서 정의한 알림 ID 등
    }
  };

  // Service Worker가 알림 표시 작업을 완료할 때까지 대기하도록 합니다.
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});


// 💡 'notificationclick' 이벤트 리스너
// 사용자가 알림을 클릭했을 때 작동하는 로직입니다.
self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.', event.notification.data);

  event.notification.close(); // 알림 창 닫기

  const clickedNotificationData = event.notification.data;
  const targetUrl = clickedNotificationData.url || '/';

  // 1. 이미 열려있는 탭이 있는지 확인합니다.
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // 앱의 기본 scope('/') 내에 있고
        // targetUrl을 포함하는 탭을 찾으면 해당 탭을 포커스하고 경로를 변경합니다.
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          if (client.url.includes(targetUrl)) {
              return client.focus();
          }
        }
      }
      
      // 2. 일치하는 탭이 없으면 새 탭을 엽니다.
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});