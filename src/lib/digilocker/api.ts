import { DIGILOCKER_CONFIG } from "./config";
import crypto from "crypto";

export class DigiLockerAPI {
  private static generateHMAC(data: string): string {
    return crypto
      .createHmac("sha256", DIGILOCKER_CONFIG.PARTNER_SECRET!)
      .update(data)
      .digest("hex");
  }

  private static async makeRequest(
    endpoint: string,
    method: string,
    data?: any
  ) {
    const url = `${DIGILOCKER_CONFIG.API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Partner-ID": DIGILOCKER_CONFIG.PARTNER_ID!,
      "X-API-Key": DIGILOCKER_CONFIG.API_KEY!,
    };

    if (data) {
      headers["X-HMAC"] = this.generateHMAC(JSON.stringify(data));
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`DigiLocker API error: ${response.statusText}`);
    }

    return response.json();
  }

  static async issueCertificate(userData: {
    name: string;
    digiLockerId: string;
    conferenceId: string;
    date: Date;
  }) {
    const certificateData = {
      docType: DIGILOCKER_CONFIG.CERTIFICATE_TYPE,
      name: userData.name,
      digiLockerId: userData.digiLockerId,
      conferenceId: userData.conferenceId,
      date: userData.date.toISOString(),
      issuer: {
        name: DIGILOCKER_CONFIG.ISSUER_NAME,
        id: DIGILOCKER_CONFIG.ISSUER_ID,
      },
    };

    return this.makeRequest("/issue", "POST", certificateData);
  }

  static async verifyCertificate(uri: string) {
    return this.makeRequest(`/verify/${uri}`, "GET");
  }

  static async pullCertificate(uri: string) {
    return this.makeRequest(`/pull/${uri}`, "GET");
  }
}
