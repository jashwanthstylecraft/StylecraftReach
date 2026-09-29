import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// OAuth access/refresh tokens are real credentials — encrypted here at the app
// layer before they ever reach Postgres (see migration 011's comment on
// social_connections.access_token). AES-256-GCM: a random 12-byte IV per
// value, auth tag appended so tampering is detectable, all base64-joined as
// `iv:authTag:ciphertext` in one string column.
function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY is not set — cannot encrypt/decrypt OAuth tokens");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes (generate with `openssl rand -base64 32`)");
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(":");
}

export function decryptSecret(stored: string): string {
  const [ivB64, authTagB64, cipherB64] = stored.split(":");
  if (!ivB64 || !authTagB64 || !cipherB64) throw new Error("Malformed encrypted value");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(cipherB64, "base64")), decipher.final()]).toString("utf8");
}
