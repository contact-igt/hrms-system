import bcrypt from "bcryptjs";

const HASH_ROUNDS = 12;

export const passwordService = {
  hash(password: string) {
    return bcrypt.hash(password, HASH_ROUNDS);
  },

  verify(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  },
};
