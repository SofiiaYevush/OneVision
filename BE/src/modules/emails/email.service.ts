import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  auth: env.MAIL_USER ? { user: env.MAIL_USER, pass: env.MAIL_PASS } : undefined,
  secure: false,
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

async function send(opts: MailOptions) {
  try {
    await transporter.sendMail({ from: env.MAIL_FROM, ...opts });
  } catch (err) {
    logger.error({ err }, 'Failed to send email');
  }
}

export function sendVerificationEmail(to: string, token: string): Promise<void> {
  const url = `${env.PUBLIC_BASE_URL}/api/auth/verify-email/${token}`;
  return send({
    to,
    subject: 'Verify your Festivo account',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#5c35f5">Welcome to Festivo!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#5c35f5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:13px">This link expires in 24 hours.</p>
      </div>
    `,
  });
}

export function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const url = `${env.PUBLIC_BASE_URL}/api/auth/reset-password/${token}`;
  return send({
    to,
    subject: 'Reset your Festivo password',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#5c35f5">Password Reset</h2>
        <p>Click below to reset your password. The link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#5c35f5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:13px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

export function sendBookingNotificationEmail(
  to: string,
  subject: string,
  body: string,
): Promise<void> {
  return send({
    to,
    subject,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#5c35f5">Festivo</h2>
        <p>${body}</p>
        <hr style="border:1px solid #f3f4f6;margin:20px 0">
        <p style="color:#9ca3af;font-size:12px">Festivo — Book talented event pros</p>
      </div>
    `,
  });
}