const BRAND_COLOR = "#4f46e5";
const BG_COLOR = "#f4f5f7";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>StrataDash</title>
</head>
<body style="margin:0;padding:0;background-color:${BG_COLOR};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_COLOR};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND_COLOR};padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">StrataDash</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
  <tr>
    <td style="border-radius:6px;background-color:${BRAND_COLOR};">
      <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:6px;">${label}</a>
    </td>
  </tr>
</table>`;
}

function footer(text: string): string {
  return `<p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">${text}</p>`;
}

export function invitationEmailHtml(
  orgName: string,
  inviterName: string,
  role: string,
  acceptUrl: string,
): string {
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#111827;font-weight:600;">You've been invited!</h2>
    <p style="margin:0 0 8px;font-size:16px;color:#374151;line-height:1.6;">
      <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on StrataDash as a <strong>${role}</strong>.
    </p>
    <p style="margin:0;font-size:16px;color:#374151;line-height:1.6;">
      Click the button below to accept the invitation and get started.
    </p>
    ${ctaButton(acceptUrl, "Accept Invitation")}
    ${footer("If you didn't expect this invitation, you can ignore this email.")}
  `;
  return layout(content);
}

export function passwordResetEmailHtml(resetUrl: string): string {
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#111827;font-weight:600;">Reset your password</h2>
    <p style="margin:0 0 8px;font-size:16px;color:#374151;line-height:1.6;">
      We received a request to reset your StrataDash password. Click the button below to choose a new password.
    </p>
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
      This link will expire in 1 hour.
    </p>
    ${ctaButton(resetUrl, "Reset Password")}
    ${footer("If you didn't request this, you can safely ignore this email. Your password will not be changed.")}
  `;
  return layout(content);
}
