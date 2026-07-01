import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

export const emailTransport =
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
 * Sends an email using the globally configured transport. In development mode
 * (when transport is null) the email details are printed to the console.
 */
export async function sendMail(to: string, subject: string, html: string) {
  if (!emailTransport) {
    if (env.NODE_ENV === 'development') {
      console.info(`[development mail] To: ${to}\nSubject: ${subject}\n${html}`);
    }
    return;
  }
  try {
    await emailTransport.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.info(`[mail sent] To: ${to} | Subject: ${subject}`);
  } catch (err) {
    console.error(`[mail error] To: ${to} | Subject: ${subject}`, err);
    throw err;
  }
}

