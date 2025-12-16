const CACHE_NAME = 'kurupiro-images-v1';

// キャッシュ対象の拡張子
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];

// リクエストが画像かどうかを判定
function isImageRequest(url) {
  return IMAGE_EXTENSIONS.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

// インストール時
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('kurupiro-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// フェッチ時：画像のみキャッシュ（Cache First戦略）
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 画像リクエストのみ処理
  if (!isImageRequest(url)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // キャッシュがあればそれを返す
          return cachedResponse;
        }

        // キャッシュがなければネットワークから取得してキャッシュ
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});
