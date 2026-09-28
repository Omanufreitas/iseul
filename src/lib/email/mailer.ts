import { CONTACT_EMAIL } from "@/lib/site";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

function emailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || `Iseul <${CONTACT_EMAIL}>`;
}

export function archiveCopyRecipient(to: string): string | null {
  const dest = to.trim().toLowerCase();
  const archive = CONTACT_EMAIL.trim().toLowerCase();
  if (!dest || dest === archive) return null;
  return CONTACT_EMAIL;
}

export function archiveCopySubject(subject: string, to: string): string {
  return `Cópia · ${subject} · ${to.trim().toLowerCase()}`;
}

function archiveCopyHtml(to: string, html: string): string {
  const dest = to.trim().toLowerCase();
  return `<div style="margin:0 0 16px;padding:10px 12px;background:#F3EEE6;color:#5D7869;font:12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Cópia interna Iseul · enviado para ${dest}</div>${html}`;
}

export function isTransactionalEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      (process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim()) ||
      (process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim()),
  );
}

async function sendWithResend(input: SendEmailInput): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("RESEND_API_KEY ausente");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom(),
      to: [input.to],
      reply_to: input.replyTo ?? CONTACT_EMAIL,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body.slice(0, 280)}`);
  }
}

async function sendWithSmtp(input: SendEmailInput): Promise<void> {
  const nodemailer = await import("nodemailer");
  const gmailUser = process.env.GMAIL_USER?.trim();
  const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();
  const host = process.env.SMTP_HOST?.trim();

  const transporter = process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim()
    ? nodemailer.createTransport({
        host: host || "smtppro.zoho.com",
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
        auth: {
          user: process.env.SMTP_USER?.trim(),
          pass: process.env.SMTP_PASS?.trim(),
        },
      })
    : nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass },
      });

  await transporter.sendMail({
    from: emailFrom(),
    to: input.to,
    replyTo: input.replyTo ?? CONTACT_EMAIL,
    subject: input.subject,
    html: input.html,
  });
}

async function deliver(input: SendEmailInput): Promise<void> {
  if (process.env.RESEND_API_KEY?.trim()) {
    await sendWithResend(input);
    return;
  }
  await sendWithSmtp(input);
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  if (!isTransactionalEmailConfigured()) {
    return { ok: false, error: "E-mail transacional sem RESEND_API_KEY, SMTP ou Gmail configurado." };
  }

  try {
    await deliver(input);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Falha ao enviar e-mail." };
  }

  const archiveTo = archiveCopyRecipient(input.to);
  if (archiveTo) {
    try {
      await deliver({
        ...input,
        to: archiveTo,
        subject: archiveCopySubject(input.subject, input.to),
        html: archiveCopyHtml(input.to, input.html),
      });
    } catch (err) {
      console.error("[email:copia-iseul]", err instanceof Error ? err.message : err);
    }
  }

  return { ok: true };
}
