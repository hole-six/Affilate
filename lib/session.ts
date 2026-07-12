// Phiên đăng nhập nhẹ: cookie chứa payload + chữ ký HMAC-SHA256.
// Dùng Web Crypto (crypto.subtle) thay vì node:crypto để chạy được cả trong
// middleware (Edge runtime) lẫn Route Handlers (Node runtime).

export type SessionPayload = {
  userId: string;
  role: "admin" | "customer";
  fullName: string;
  customerId?: string | null;
};

export const SESSION_COOKIE = "affiliate_session";

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET chưa được cấu hình trong .env");
  return crypto.subtle.importKey(
    "raw",
    toArrayBuffer(new TextEncoder().encode(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const key = await getKey();
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const payloadB64 = base64UrlEncode(payloadBytes);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    toArrayBuffer(new TextEncoder().encode(payloadB64))
  );
  const sigB64 = base64UrlEncode(new Uint8Array(signature));
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      toArrayBuffer(base64UrlDecode(sigB64)),
      toArrayBuffer(new TextEncoder().encode(payloadB64))
    );
    if (!valid) {
      console.error("[session-debug] signature invalid", { secretPresent: Boolean(process.env.SESSION_SECRET) });
      return null;
    }
    const json = new TextDecoder().decode(base64UrlDecode(payloadB64));
    return JSON.parse(json) as SessionPayload;
  } catch (e) {
    console.error("[session-debug] verify threw", e instanceof Error ? e.message : e, {
      secretPresent: Boolean(process.env.SESSION_SECRET),
    });
    return null;
  }
}
