const PASSPHRASE = "lendswift-production-secure-key-phrase-2026";

async function getEncryptionKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKey = enc.encode(PASSPHRASE);
  
  // Static salt to ensure same key is derived on page reload
  const salt = enc.encode("lendswift-crypto-salt");
  
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  
  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a string of text (such as stringified form state) using AES-256-GCM.
 * Returns a base64 encoded string containing the 12-byte IV prepended to the ciphertext.
 */
export async function encryptData(dataString: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = enc.encode(dataString);
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encodedData
    );
    
    // Prepend IV to encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to Base64
    let binary = "";
    const len = combined.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(combined[i]);
    }
    return window.btoa(binary);
  } catch (err) {
    console.error("Encryption failed:", err);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypts a base64 string encrypted with encryptData.
 * Returns the original plain text string.
 */
export async function decryptData(base64String: string): Promise<string> {
  try {
    const dec = new TextDecoder();
    const key = await getEncryptionKey();
    
    // Decode Base64 to Uint8Array
    const binary = window.atob(base64String);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }
    
    if (combined.length < 13) {
      throw new Error("Invalid encrypted data format");
    }
    
    // Extract IV and Ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      ciphertext
    );
    
    return dec.decode(decrypted);
  } catch (err) {
    console.error("Decryption failed:", err);
    throw new Error("Failed to decrypt data");
  }
}
