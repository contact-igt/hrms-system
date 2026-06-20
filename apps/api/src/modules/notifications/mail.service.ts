import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

const transport =
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

async function send(to: string, subject: string, text: string) {
  if (!transport) {
    if (env.NODE_ENV === "development") {
      console.info(`[development mail] To: ${to}\nSubject: ${subject}\n${text}`);
    }
    return;
  }

  await transport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
  });
}

export const mailService = {
  sendOtp(to: string, otp: string, purpose: string) {
    return send(
      to,
      `Your Orbix HRMS ${purpose.toLowerCase().replaceAll("_", " ")} code`,
      `Your verification code is ${otp}. It expires in ${env.OTP_EXPIRES_IN_MINUTES} minutes.`,
    );
  },

  sendInvitation(
    to: string,
    organizationName: string,
    invitationToken: string,
  ) {
    const link = `${env.WEB_URL}/register?invitation=${encodeURIComponent(
      invitationToken,
    )}`;
    return send(
      to,
      `You are invited to ${organizationName}`,
      `Activate your Orbix HRMS account using this link: ${link}`,
    );
  },
};
