import { createHmac, createHash, randomBytes, randomInt, randomUUID } from "node:crypto";

export const createId = () => randomUUID();

export const createRandomToken = (bytes = 32) =>
  randomBytes(bytes).toString("base64url");

export const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export const createOtp = () => randomInt(100000, 1000000).toString();

export const digestOtp = (challengeId: string, otp: string, secret: string) =>
  createHmac("sha256", secret)
    .update(`${challengeId}:${otp}`)
    .digest("hex");

export const maskEmail = (email: string) => {
  const [local = "", domain = ""] = email.split("@");
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, local.length - 2))}@${domain}`;
};
