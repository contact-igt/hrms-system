import { and, desc, eq, isNull } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../database/client.js";
import { otpChallenges } from "../../database/index.js";
import { AppError } from "../../common/errors/app-error.js";
import {
  createId,
  createOtp,
  digestOtp,
  maskEmail,
} from "../../common/utils/crypto.js";
import { addMinutes } from "../../common/utils/date.js";
import { mailService } from "../notifications/mail.service.js";

export type OtpPurpose = "EMAIL_VERIFICATION" | "LOGIN" | "PASSWORD_RESET";

export async function createOtpChallenge(input: {
  userId?: string;
  destination: string;
  purpose: OtpPurpose;
}) {
  await db
    .update(otpChallenges)
    .set({ consumedAt: new Date() })
    .where(
      and(
        eq(otpChallenges.destination, input.destination),
        eq(otpChallenges.purpose, input.purpose),
        isNull(otpChallenges.consumedAt),
      ),
    );

  const challengeId = createId();
  const otp = createOtp();
  const expiresAt = addMinutes(new Date(), env.OTP_EXPIRES_IN_MINUTES);

  await db.insert(otpChallenges).values({
    id: challengeId,
    userId: input.userId,
    destination: input.destination,
    purpose: input.purpose,
    codeDigest: digestOtp(challengeId, otp, env.OTP_SECRET),
    maxAttempts: env.OTP_MAX_ATTEMPTS,
    expiresAt,
  });

  await mailService.sendOtp(input.destination, otp, input.purpose);

  return {
    challengeId,
    purpose: input.purpose,
    maskedDestination: maskEmail(input.destination),
    expiresInSeconds: env.OTP_EXPIRES_IN_MINUTES * 60,
  };
}

export async function verifyOtpChallenge(input: {
  challengeId: string;
  purpose: OtpPurpose;
  otp: string;
  consume?: boolean;
}) {
  const [challenge] = await db
    .select()
    .from(otpChallenges)
    .where(
      and(
        eq(otpChallenges.id, input.challengeId),
        eq(otpChallenges.purpose, input.purpose),
      ),
    )
    .limit(1);

  if (!challenge || challenge.consumedAt) {
    throw new AppError(400, "OTP is invalid or already used.", "AUTH_OTP_INVALID");
  }

  if (challenge.expiresAt <= new Date()) {
    throw new AppError(400, "OTP has expired.", "AUTH_OTP_EXPIRED");
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    throw new AppError(
      429,
      "Maximum OTP attempts exceeded.",
      "AUTH_OTP_ATTEMPTS_EXCEEDED",
    );
  }

  const expected = digestOtp(challenge.id, input.otp, env.OTP_SECRET);
  if (expected !== challenge.codeDigest) {
    await db
      .update(otpChallenges)
      .set({ attempts: challenge.attempts + 1 })
      .where(eq(otpChallenges.id, challenge.id));
    throw new AppError(400, "OTP is invalid.", "AUTH_OTP_INVALID");
  }

  if (input.consume !== false) {
    await db
      .update(otpChallenges)
      .set({ consumedAt: new Date() })
      .where(eq(otpChallenges.id, challenge.id));
  }

  return challenge;
}

export async function resendOtpChallenge(
  challengeId: string,
  purpose: OtpPurpose,
) {
  const [challenge] = await db
    .select()
    .from(otpChallenges)
    .where(
      and(
        eq(otpChallenges.id, challengeId),
        eq(otpChallenges.purpose, purpose),
      ),
    )
    .orderBy(desc(otpChallenges.createdAt))
    .limit(1);

  if (!challenge) {
    throw new AppError(404, "OTP challenge was not found.", "AUTH_OTP_INVALID");
  }

  const elapsedSeconds = Math.floor(
    (Date.now() - challenge.createdAt.getTime()) / 1000,
  );
  if (elapsedSeconds < env.OTP_RESEND_COOLDOWN_SECONDS) {
    throw new AppError(
      429,
      `Wait ${env.OTP_RESEND_COOLDOWN_SECONDS - elapsedSeconds} seconds before resending.`,
      "AUTH_OTP_RESEND_LIMITED",
    );
  }

  return createOtpChallenge({
    userId: challenge.userId ?? undefined,
    destination: challenge.destination,
    purpose,
  });
}
