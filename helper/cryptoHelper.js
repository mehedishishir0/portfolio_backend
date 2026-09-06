const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || "default_portfolio_secret_key_2FA";
  return crypto.createHash("sha256").update(secret).digest();
};

/**
 * Encrypts a text string using AES-256-GCM.
 * @param {string} text - The plain text to encrypt.
 * @returns {string} - Encrypted format: "iv_hex:authTag_hex:encrypted_hex"
 */
exports.encryptSecret = (text) => {
  if (!text) return null;
  const key = getSecretKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

/**
 * Decrypts an encrypted text string.
 * @param {string} encryptedText - Encrypted string formatted as "iv_hex:authTag_hex:encrypted_hex"
 * @returns {string|null} - Plain text or null if decryption fails.
 */
exports.decryptSecret = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const key = getSecretKey();
    const parts = encryptedText.split(":");
    if (parts.length !== 3) return null;

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Failed to decrypt secret:", error.message);
    return null;
  }
};

/**
 * Generates a random 8-character recovery code string (e.g. "ABCD-1234").
 */
exports.generateRecoveryCode = () => {
  const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${part1}-${part2}`;
};

/**
 * Hashes a recovery code for secure DB storage.
 */
exports.hashRecoveryCode = (code) => {
  return crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
};
