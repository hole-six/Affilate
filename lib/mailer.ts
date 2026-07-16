import nodemailer from "nodemailer";

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) return null;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; simulated: boolean; error?: string }> {
  const transporter = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME || "Affiliate Hoan Tien";
  const fromAddress = process.env.SMTP_USER;

  if (!transporter || !fromAddress) {
    // Chưa cấu hình SMTP — không throw, chỉ báo simulated để không làm hỏng
    // luồng chính (giống pattern notifyCustomerTelegram best-effort).
    return { ok: true, simulated: true, error: "SMTP chưa được cấu hình" };
  }

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    return { ok: true, simulated: false };
  } catch (error) {
    return {
      ok: false,
      simulated: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const BRAND_COLOR = "#e86a33";

function emailShell(bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background-color:#f6f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f3ef;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#fff3ee 0%,#fde8d8 50%,#ffecd2 100%);padding:32px 32px 24px;text-align:center;">
              <div style="font-size:15px;font-weight:800;color:${BRAND_COLOR};letter-spacing:0.5px;text-transform:uppercase;">Affiliate Hoàn Tiền</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#faf8f6;text-align:center;">
              <div style="font-size:12px;color:#a0816a;">Đây là email tự động, vui lòng không trả lời trực tiếp email này.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export function buildPasswordResetEmail(params: { fullName: string; resetUrl: string; expiresInMinutes: number }): string {
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#2d1f14;">Đặt lại mật khẩu</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#6b5847;">Xin chào <strong>${escapeHtml(params.fullName)}</strong>,</p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#6b5847;">
      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Bấm nút bên dưới để tạo mật khẩu mới
      (liên kết có hiệu lực trong ${params.expiresInMinutes} phút):
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="border-radius:16px;background:linear-gradient(135deg,${BRAND_COLOR},#d65d2a);">
          <a href="${params.resetUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;border-radius:16px;">
            Đặt lại mật khẩu
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#a0816a;">
      Nếu nút không hoạt động, sao chép đường dẫn sau vào trình duyệt:
    </p>
    <p style="margin:0 0 24px;font-size:12px;line-height:1.6;color:${BRAND_COLOR};word-break:break-all;">${params.resetUrl}</p>
    <p style="margin:0;font-size:12px;line-height:1.6;color:#a0816a;">
      Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — mật khẩu hiện tại của bạn vẫn an toàn.
    </p>
  `);
}

export function buildPasswordChangedEmail(params: { fullName: string }): string {
  return emailShell(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#2d1f14;">Mật khẩu đã được thay đổi</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#6b5847;">Xin chào <strong>${escapeHtml(params.fullName)}</strong>,</p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#6b5847;">
      Mật khẩu tài khoản của bạn vừa được thay đổi thành công. Nếu đây không phải là bạn, vui lòng liên hệ hỗ trợ ngay lập tức.
    </p>
  `);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
