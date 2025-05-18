import crypto from "crypto";

/**
 * Validate the HMAC signature from DigiLocker
 * @param body The request body
 * @param hmacHeader The HMAC header from DigiLocker
 * @returns True if the HMAC is valid, false otherwise
 */
export const validateDigiLockerHmac = (
  body: string,
  hmacHeader: string | null | undefined
): boolean => {
  if (!hmacHeader) {
    return false;
  }

  const digiLockerApiKey = process.env.DIGILOCKER_API_KEY;
  if (!digiLockerApiKey) {
    console.error("DIGILOCKER_API_KEY is not defined");
    return false;
  }

  // Create HMAC using SHA256 with the DigiLocker API key
  const hmac = crypto.createHmac("sha256", digiLockerApiKey);
  hmac.update(body);
  const calculatedSignature = hmac.digest("base64");

  // Compare the calculated signature with the provided one
  return calculatedSignature === hmacHeader;
};
