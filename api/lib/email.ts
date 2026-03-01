import { Resend } from "resend";

const FROM_ADDRESS = "StrataDash <noreply@stratadash.org>";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping email send");
    return null;
  }
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    ...options,
  });
  if (error) {
    console.error("[email] Failed to send:", error);
    return null;
  }
  return data;
}
