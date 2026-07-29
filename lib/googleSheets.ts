import { createSign } from "crypto";

// Cố tình KHÔNG dùng package `googleapis` — package đó rất nặng (bundle
// client cho ~200 API Google khác nhau) và từng làm build bị OOM-kill trên
// VPS RAM hạn chế. Tự ký JWT (RS256) bằng crypto có sẵn của Node + gọi
// thẳng REST API của Sheets qua fetch() — không thêm dependency nào cả.

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

function base64url(input: Buffer | string): string {
  return (Buffer.isBuffer(input) ? input : Buffer.from(input))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signJwtAssertion(clientEmail: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: clientEmail,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claimSet))}`;
  const signature = createSign("RSA-SHA256").update(signingInput).sign(privateKey);
  return `${signingInput}.${base64url(signature)}`;
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey || !SPREADSHEET_ID) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }

  const assertion = signJwtAssertion(clientEmail, privateKey);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.accessToken;
}

// Tên tab thật trong spreadsheet ("Sheet1" chỉ là mặc định của Google, có
// thể đã bị đổi tên) — tra 1 lần rồi cache lại, tránh hardcode sai tên.
let cachedSheetTitle: string | null = null;

async function getFirstSheetTitle(accessToken: string): Promise<string> {
  if (cachedSheetTitle) return cachedSheetTitle;
  const res = await fetch(`${SHEETS_API_BASE}/${SPREADSHEET_ID}?fields=sheets.properties.title`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Google Sheets metadata fetch failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { sheets?: { properties?: { title?: string } }[] };
  const title = data.sheets?.[0]?.properties?.title;
  if (!title) throw new Error("Không tìm thấy sheet nào trong spreadsheet");
  cachedSheetTitle = title;
  return title;
}

export function formatRegistrationSourceLabel(source: string | null | undefined): string {
  switch (source) {
    case "email":
      return "Email";
    case "google":
      return "GG";
    case "admin":
      return "Admin tạo";
    case "telegram":
      return "Telegram";
    case "zalo":
      return "Zalo";
    default:
      return "Không rõ";
  }
}

export function formatReferralSourceLabel(
  referredBy: { fullName: string; customerCode: string } | null | undefined
): string {
  if (!referredBy) return "Trực tiếp";
  return `Được giới thiệu bởi ${referredBy.fullName} (${referredBy.customerCode})`;
}

// Đẩy 1 khách vừa đăng ký thật (email/Google/admin-tạo-có-email) lên đúng
// Google Sheet CRM admin đang quản lý thủ công — chủ động best-effort,
// không bao giờ throw ra ngoài: nếu Sheets API lỗi/hết quota thì luồng
// đăng ký của khách vẫn phải thành công bình thường, giống hệt pattern
// sendMail() hiện có.
export async function appendCustomerRow(row: {
  customerCode: string;
  fullName: string;
  phone: string | null;
  email: string;
  registeredAt: Date;
  registrationSource: string;
  referredBy: { fullName: string; customerCode: string } | null;
}): Promise<void> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.warn("[GOOGLE_SHEETS_SYNC_SKIPPED] Thiếu cấu hình GOOGLE_SHEETS_* trong .env");
      return;
    }

    const sheetTitle = await getFirstSheetTitle(accessToken);

    // STT kế tiếp = số dòng hiện có ở cột A (bao gồm dòng tiêu đề) — vì
    // dòng tiêu đề chiếm vị trí 1, số dòng đó đúng bằng STT tiếp theo cần
    // gán cho dòng dữ liệu mới.
    const readRes = await fetch(
      `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(`${sheetTitle}!A:A`)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!readRes.ok) throw new Error(`Đọc sheet thất bại: ${readRes.status} ${await readRes.text()}`);
    const readData = (await readRes.json()) as { values?: unknown[][] };
    const nextStt = readData.values?.length ?? 1;

    const registeredDate = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(row.registeredAt);

    const appendRes = await fetch(
      `${SHEETS_API_BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(`${sheetTitle}!A:H`)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [
            [
              nextStt,
              registeredDate,
              row.customerCode,
              row.fullName,
              row.phone ?? "",
              row.email,
              formatRegistrationSourceLabel(row.registrationSource),
              formatReferralSourceLabel(row.referredBy),
            ],
          ],
        }),
      }
    );
    if (!appendRes.ok) throw new Error(`Ghi sheet thất bại: ${appendRes.status} ${await appendRes.text()}`);

    console.log(`[GOOGLE_SHEETS_SYNC_OK] Đã thêm dòng cho khách ${row.customerCode}`);
  } catch (err) {
    console.error("[GOOGLE_SHEETS_SYNC_FAILED]", err instanceof Error ? err.message : err);
  }
}
