// lib/encryption.ts

import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTE_LENGTH = 32; // AES-256 requires a 32-byte key
const IV_BYTE_LENGTH = 16;  // GCM standard is 12, but 16 is widely supported and simple
const AUTH_TAG_BYTE_LENGTH = 16; // GCM standard auth tag length
const ENCODING = 'hex'; // Use hex for easy string representation
const DELIMITER = ':'; // Delimiter for storing iv:authTag:ciphertext

let encryptionKey: Buffer;

// --- Key Initialization and Validation ---
// This code runs once when the module is first loaded.
// It ensures the key is present and valid before the app fully starts or handles requests.
try {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set.');
  }
  encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, ENCODING);

  if (encryptionKey.length !== KEY_BYTE_LENGTH) {
    throw new Error(
      `Invalid ENCRYPTION_KEY length. Expected ${KEY_BYTE_LENGTH * 2} hex characters (${KEY_BYTE_LENGTH} bytes), but got ${encryptionKey.length} bytes.`
    );
  }
  console.log("Encryption key loaded successfully."); // Optional: confirm key load on server start
} catch (error: any) {
  console.error("FATAL SERVER ERROR: Failed to initialize encryption key -", error.message);
  // In a real production scenario, you might want the application to fail startup
  // if the encryption key is missing or invalid. How depends on your deployment.
  // For now, subsequent calls to encrypt/decrypt will likely fail if key is invalid.
  // Assigning a dummy buffer to prevent immediate crashes on reference, but operations will fail.
  encryptionKey = Buffer.alloc(KEY_BYTE_LENGTH);
}


// --- Encryption Function ---
export function encrypt(text: string): string | null {
  if (!Buffer.isBuffer(encryptionKey) || encryptionKey.length !== KEY_BYTE_LENGTH) {
     console.error("Encryption aborted: Encryption key is not valid.");
     return null;
  }
  try {
    // 1. Generate a unique Initialization Vector (IV) for each encryption
    const iv = crypto.randomBytes(IV_BYTE_LENGTH);

    // 2. Create the AES-GCM cipher instance
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv, {
       authTagLength: AUTH_TAG_BYTE_LENGTH
    });

    // 3. Encrypt the text (update + final)
    let encrypted = cipher.update(text, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    // 4. Get the authentication tag (crucial for GCM integrity)
    const authTag = cipher.getAuthTag();

    // 5. Combine IV, auth tag, and ciphertext for storage
    // Format: iv(hex):authTag(hex):ciphertext(hex)
    return `${iv.toString(ENCODING)}${DELIMITER}${authTag.toString(ENCODING)}${DELIMITER}${encrypted}`;

  } catch (error) {
    console.error('Encryption failed:', error);
    return null; // Return null on failure
  }
}

// --- Decryption Function ---
export function decrypt(encryptedText: string): string | null {
  if (!Buffer.isBuffer(encryptionKey) || encryptionKey.length !== KEY_BYTE_LENGTH) {
     console.error("Decryption aborted: Encryption key is not valid.");
     return null;
  }
  if (!encryptedText || typeof encryptedText !== 'string') {
     console.error('Decryption failed: Invalid input provided.');
     return null;
  }

  try {
    // 1. Split the stored string back into its parts
    const parts = encryptedText.split(DELIMITER);
    if (parts.length !== 3) {
      console.error(`Decryption failed: Invalid encrypted text format. Expected 3 parts, got ${parts.length}. Input: ${encryptedText.substring(0, 50)}...`);
      return null;
    }

    // 2. Decode the IV, auth tag, and ciphertext from hex
    const iv = Buffer.from(parts[0], ENCODING);
    const authTag = Buffer.from(parts[1], ENCODING);
    const ciphertext = parts[2];

    // 3. Basic length checks for decoded parts
    if (iv.length !== IV_BYTE_LENGTH) {
        console.error(`Decryption failed: Invalid IV length. Expected ${IV_BYTE_LENGTH}, got ${iv.length}`);
        return null;
    }
     if (authTag.length !== AUTH_TAG_BYTE_LENGTH) {
        console.error(`Decryption failed: Invalid Auth Tag length. Expected ${AUTH_TAG_BYTE_LENGTH}, got ${authTag.length}`);
        return null;
    }


    // 4. Create the AES-GCM decipher instance
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv, {
       authTagLength: AUTH_TAG_BYTE_LENGTH
    });

    // 5. Set the authentication tag (critical for GCM verification)
    decipher.setAuthTag(authTag);

    // 6. Decrypt the text (update + final)
    let decrypted = decipher.update(ciphertext, ENCODING, 'utf8');
    decrypted += decipher.final('utf8'); // final() will throw if auth tag verification fails

    return decrypted;

  } catch (error) {
    console.error('Decryption failed:', error);
    // Errors commonly occur here if:
    // - The key is incorrect
    // - The data was tampered with (auth tag mismatch)
    // - The data format is wrong
    // - The IV was reused with the same key (less likely with random IVs)
    return null; // Return null on failure
  }
}