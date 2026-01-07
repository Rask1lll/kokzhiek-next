"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  // return null;
  useEffect(() => {
    // Проверяем, что мы в браузере
    if (typeof window === "undefined") {
      return;
    }

    // Проверяем поддержку Service Worker
    if (!("serviceWorker" in navigator)) {
      return;
    }

    // Регистрируем Service Worker только после полной загрузки страницы
    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log(
            "Service Worker registered successfully:",
            registration.scope
          );

          // Проверяем обновления Service Worker
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  console.log("New Service Worker available. Please refresh.");
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    };

    // Регистрируем после загрузки страницы
    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker);
    }
  }, []);

  return null;
}
