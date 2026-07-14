"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Khong chan trai nghiem neu dang ky service worker that bai.
      });
    }
  }, []);

  return null;
}
