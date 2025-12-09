const STORAGE_KEY = 'storage_x9';
const PBKDF_SALT = 'app-static-salt-v1';

const textEncoder = (s) => new TextEncoder().encode(s);
const textDecoder = (buf) => new TextDecoder().decode(buf);

async function deriveKey(passphrase) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    textEncoder(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: textEncoder(PBKDF_SALT),
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptString(plain, passphrase) {
  const key = await deriveKey(passphrase);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const ct = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    textEncoder(plain)
  );

  const combined = new Uint8Array(iv.byteLength + ct.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ct), iv.byteLength);

  const b64 = btoa(String.fromCharCode(...combined));
  return b64;
}

async function decryptString(b64, passphrase) {
  const combinedStr = atob(b64);
  const combined = new Uint8Array(combinedStr.split('').map((c) => c.charCodeAt(0)));
  const iv = combined.slice(0, 12);
  const ct = combined.slice(12);
  const key = await deriveKey(passphrase);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return textDecoder(plainBuf);
}

export async function setEncryptedToken(token, passphrase) {
  if (!token) return;
  if (!passphrase) throw new Error('Passphrase required for encryption');
  const b64 = await encryptString(token, passphrase);
  sessionStorage.setItem(STORAGE_KEY, b64);
}

export async function getEncryptedToken(passphrase) {
  const b64 = sessionStorage.getItem(STORAGE_KEY);
  if (!b64) return null;
  try {
    if (!passphrase) throw new Error('Passphrase required for decryption');
    const token = await decryptString(b64, passphrase);
    return token;
  } catch (err) {
    console.error('secureStorage: decrypt failed', err);
    return null;
  }
}

export function removeEncryptedToken() {
  sessionStorage.removeItem(STORAGE_KEY);
}
