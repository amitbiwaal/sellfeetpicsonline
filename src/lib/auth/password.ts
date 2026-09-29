import bcrypt from "bcryptjs";

const ROUNDS = 12;

export function hashPassword(password: string) {
  return bcrypt.hash(password, ROUNDS);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Minimum rules for admin passwords. Returns an error message or null. */
export function passwordProblem(password: string) {
  if (password.length < 10) return "Password must be at least 10 characters.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain letters and numbers.";
  }
  return null;
}
