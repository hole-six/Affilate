"use client";

import { useEffect } from "react";

// Mỗi lần CI build lại và deploy, toàn bộ file JS trong .next/static bị thay
// bằng bộ hash mới — ai đang mở app từ TRƯỚC lần deploy đó vẫn giữ tham chiếu
// tới file cũ đã không còn tồn tại trên server, dẫn tới ChunkLoadError (404/400)
// khi Next.js cố tải thêm 1 trang/chunk mới. Bắt lỗi này và tự reload 1 lần để
// lấy đúng bộ file mới nhất — dùng sessionStorage để không lặp vô hạn nếu lỗi
// thật sự do mạng chứ không phải do bản build cũ.
const RELOAD_GUARD_KEY = "chunk-error-reload-attempted";

function isChunkLoadError(reason: unknown): boolean {
  if (!reason) return false;
  const message = reason instanceof Error ? reason.message : String(reason);
  const name = reason instanceof Error ? reason.name : "";
  return name === "ChunkLoadError" || /Loading chunk [\w.-]+ failed/i.test(message);
}

function reloadOnce() {
  if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return;
  sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
  window.location.reload();
}

export function ChunkErrorRecovery() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error)) reloadOnce();
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) reloadOnce();
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
