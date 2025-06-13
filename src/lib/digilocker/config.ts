export const DIGILOCKER_CONFIG = {
  API_BASE_URL:
    process.env.DIGILOCKER_API_BASE_URL || "https://api.digitallocker.gov.in",
  PARTNER_ID: process.env.DIGILOCKER_PARTNER_ID,
  PARTNER_SECRET: process.env.DIGILOCKER_PARTNER_SECRET,
  API_KEY: process.env.DIGILOCKER_API_KEY,
  CERTIFICATE_TYPE: "PHARMA_CONFERENCE_CERTIFICATE",
  ISSUER_NAME: process.env.DIGILOCKER_ISSUER_NAME || "Your Organization Name",
  ISSUER_ID: process.env.DIGILOCKER_ISSUER_ID,
};

export const CERTIFICATE_TEMPLATE = {
  title: "Conference Attendance Certificate",
  description: "Certificate of attendance for pharmaceutical conference",
  validFrom: new Date().toISOString(),
  validTo: new Date(
    new Date().setFullYear(new Date().getFullYear() + 1)
  ).toISOString(),
};
