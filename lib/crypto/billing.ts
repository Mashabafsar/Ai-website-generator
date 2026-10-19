import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

const ALGO = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_BYTES = 32;

export class BillingEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingEncryptionError";
  }
}

/** Resolve a 32-byte key from base64 or hex BILLING_ENCRYPTION_KEY. */
export function resolveBillingKey(raw = env.billing.encryptionKey): Buffer {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new BillingEncryptionError("BILLING_ENCRYPTION_KEY is not configured.");
  }

  let key: Buffer | null = null;
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    key = Buffer.from(trimmed, "hex");
  } else {
    try {
      key = Buffer.from(trimmed, "base64");
    } catch (err) {
      throw new BillingEncryptionError(
        `BILLING_ENCRYPTION_KEY is not valid base64 or hex: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  if (key.length !== KEY_BYTES) {
    throw new BillingEncryptionError(
      `BILLING_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes (got ${key.length}).`
    );
  }
  return key;
}

export type EncryptedBillingBlob = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

/** Encrypt a JSON-serializable billing payload. Never pass card PANs. */
export function encryptBillingPayload(payload: unknown): EncryptedBillingBlob {
  const key = resolveBillingKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

/** Decrypt a BillingRecord blob back to a typed object. */
export function decryptBillingPayload<T = unknown>(blob: EncryptedBillingBlob): T {
  const key = resolveBillingKey();
  const iv = Buffer.from(blob.iv, "base64");
  const authTag = Buffer.from(blob.authTag, "base64");
  const ciphertext = Buffer.from(blob.ciphertext, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8")) as T;
}
