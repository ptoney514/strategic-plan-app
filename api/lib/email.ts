import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_ADDRESS = "StrataDash <noreply@stratadash.org>";

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
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
