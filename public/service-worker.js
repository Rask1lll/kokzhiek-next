const CACHE_NAME = "kokzhiek-v1.07";
const BOOKS_PAGE = "/books";
const BOOK_PAGE = "/books/book";
const CHAPTER_PAGE = "/books/book/chapter";

// Проверка, является ли запрос API запросом книг (для кеширования)
function isBooksApiRequest(url) {
  // Кешируем GET запросы к API книг (список книг и отдельная книга)
  return url.pathname.startsWith("/api/v1/books");
}

// Проверка, является ли ресурс статическим
function isStaticResource(url) {
  return (
    url.pathname.match(
      /\.(js|css|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)$/i
    ) ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image")
  );
}

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(() => {
      console.log("[Service Worker] Cache opened");
      // Не кешируем при установке, будем кешировать по требованию
      return self.skipWaiting();
    })
  );
});

// Активация Service Worker
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[Service Worker] Removing old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Кешируем только GET запросы
  if (request.method !== "GET") {
    return;
  }

  // Для API запросов книг используем стратегию Network First
  if (isBooksApiRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Кешируем только успешные ответы
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, используем кеш
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Если нет в кеше, возвращаем ошибку
            return new Response(
              JSON.stringify({ success: false, message: "Offline" }),
              {
                status: 503,
                statusText: "Service Unavailable",
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // Для страницы /books используем стратегию Cache First
  if (url.pathname === BOOKS_PAGE || url.pathname === BOOKS_PAGE + "/") {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Обновляем кеш в фоне
          fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
            })
            .catch(() => {
              // Игнорируем ошибки обновления кеша
            });
          return cachedResponse;
        }

        // Если нет в кеше, загружаем из сети
        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // Если не удалось загрузить, возвращаем кешированную версию или null
            return (
              caches.match(BOOKS_PAGE) ||
              new Response("Offline", {
                status: 503,
                statusText: "Service Unavailable",
              })
            );
          });
      })
    );
  }
  // Для страницы отдельной книги /books/book используем стратегию Cache First
  else if (
    url.pathname === BOOK_PAGE ||
    url.pathname.startsWith(BOOK_PAGE + "/")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Обновляем кеш в фоне
          fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
            })
            .catch(() => {
              // Игнорируем ошибки обновления кеша
            });
          return cachedResponse;
        }

        // Если нет в кеше, загружаем из сети
        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // Если не удалось загрузить, возвращаем кешированную версию
            return (
              caches.match(request) ||
              new Response("Offline", {
                status: 503,
                statusText: "Service Unavailable",
              })
            );
          });
      })
    );
  }
  // Для страницы главы /books/book/chapter используем стратегию Cache First
  else if (
    url.pathname === CHAPTER_PAGE ||
    url.pathname.startsWith(CHAPTER_PAGE + "/")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Обновляем кеш в фоне
          fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
            })
            .catch(() => {
              // Игнорируем ошибки обновления кеша
            });
          return cachedResponse;
        }

        // Если нет в кеше, загружаем из сети
        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return response;
          })
          .catch(() => {
            // Если не удалось загрузить, возвращаем кешированную версию
            return (
              caches.match(request) ||
              new Response("Offline", {
                status: 503,
                statusText: "Service Unavailable",
              })
            );
          });
      })
    );
  }
  // Для статических ресурсов используем Cache First
  else if (isStaticResource(url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  }
  // Для остальных запросов используем Network First
  else {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Кешируем только успешные HTML ответы
          if (
            response.status === 200 &&
            response.headers.get("content-type")?.includes("text/html")
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});
