import { createHash, timingSafeEqual } from "node:crypto";

export const AUTH_COOKIE = "edit_token";

function pin(): string {
  return process.env.EDIT_PIN || "1234";
}

export function expectedToken(): string {
  return createHash("sha256").update(`gdt-v1:${pin()}`).digest("hex");
}

export function pinMatches(candidate: string): boolean {
  const a = createHash("sha256").update(`gdt-v1:${candidate}`).digest();
  const b = createHash("sha256").update(`gdt-v1:${pin()}`).digest();
  return timingSafeEqual(a, b);
}

export function tokenIsValid(token: string | undefined): boolean {
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expectedToken());
  return a.length === b.length && timingSafeEqual(a, b);
}
