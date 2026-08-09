"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // força checar por uma versão nova agora, em vez de esperar o
        // navegador decidir sozinho (no iOS isso podia demorar visitas)
        registration.update();
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker?.addEventListener("statechange", () => {
            if (newWorker.state === "activated") window.location.reload();
          });
        });
      })
      .catch(() => {});

    // quando um service worker novo assume o controle, recarrega uma vez
    // pra garantir que o HTML/JS na tela batem com o que está ativo agora
    let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }, []);

  return null;
}
