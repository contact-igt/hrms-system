import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

/** Global Nodemailer transport based on environment variables */
export const transport =
  env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      })
    : null;

/**
 * Sends an e‑mail using the globally configured transport. In development mode the
 * e‑mail data is printed to the console instead of being sent.
 */
export async function sendMail(to: string, subject: string, html: string) {
  if (!transport) {
    if (env.NODE_ENV === 'development') {
      console.info(`[development mail] To: ${to}\nSubject: ${subject}\n${html}`);
    }
    return;
  }
  await transport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}
