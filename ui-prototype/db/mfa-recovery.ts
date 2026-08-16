import { and, eq, isNull } from "drizzle-orm";
import { hashOpaqueToken } from "@/app/lib/security";
import { getDb } from "./index";
import { mfaRecoveryCodes } from "./schema";

function newRecoveryCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `${value.slice(0, 5)}-${value.slice(5, 10)}-${value.slice(10, 15)}-${value.slice(15)}`;
}

export async function ensureMfaRecoveryCodes(userId: string) {
  const existing = await getDb().select({ id: mfaRecoveryCodes.id }).from(mfaRecoveryCodes).where(and(eq(mfaRecoveryCodes.userId, userId), isNull(mfaRecoveryCodes.usedAt))).limit(1).get();
  if (existing) return null;
  const codes = Array.from({ length: 10 }, newRecoveryCode);
  const hashes = await Promise.all(codes.map(hashOpaqueToken));
  await getDb().insert(mfaRecoveryCodes).values(hashes.map((codeHash) => ({ id: crypto.randomUUID(), userId, codeHash }))).run();
  return codes;
}

export async function consumeMfaRecoveryCode(userId: string, code: string) {
  const codeHash = await hashOpaqueToken(code.trim().toUpperCase());
  return Boolean(await getDb().update(mfaRecoveryCodes).set({ usedAt: new Date() }).where(and(eq(mfaRecoveryCodes.userId, userId), eq(mfaRecoveryCodes.codeHash, codeHash), isNull(mfaRecoveryCodes.usedAt))).returning({ id: mfaRecoveryCodes.id }).get());
}

export async function revokeMfaRecoveryCodes(userId: string) {
  await getDb().delete(mfaRecoveryCodes).where(eq(mfaRecoveryCodes.userId, userId)).run();
}
