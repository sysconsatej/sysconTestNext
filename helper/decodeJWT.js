export default function decodeJWT(token) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const payload = parts[1];

  // Replace URL-safe characters (- and _) with base64 characters (+ and /)
  let base64Url = payload.replace(/-/g, "+").replace(/_/g, "/");

  // Pad the base64Url string to make it a multiple of 4 characters
  const padding = base64Url.length % 4;
  if (padding) {
    base64Url += "=".repeat(4 - padding); // Add required padding
  }

  try {
    const decodedPayload = JSON.parse(atob(base64Url));
    return decodedPayload;
  } catch (error) {
    throw new Error("Failed to decode JWT: " + error.message);
  }
}
