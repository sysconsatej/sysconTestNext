// helper/cryptoUrl.js
const enc = new TextEncoder();
const dec = new TextDecoder();

const toB64url = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/,"");

const fromB64url = (str) =>
  Uint8Array.from(atob(str.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));

async function deriveKey(pass, salt) {
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(pass), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptText(plain, passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await deriveKey(passphrase, salt);
  const ct   = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(String(plain)));
  // package as base64url(salt).base64url(iv).base64url(ciphertext)
  return `${toB64url(salt)}.${toB64url(iv)}.${toB64url(ct)}`;
}

export async function decryptText(payload, passphrase) {
  const [sB64, iB64, cB64] = String(payload).split(".");
  const salt = fromB64url(sB64);
  const iv   = fromB64url(iB64);
  const ct   = fromB64url(cB64);
  const key  = await deriveKey(passphrase, salt);
  const pt   = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return dec.decode(pt);
}
