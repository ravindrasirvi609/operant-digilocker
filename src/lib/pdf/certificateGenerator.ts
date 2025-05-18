import PDFDocument from "pdfkit";
import { IUser } from "../db/models/user";
import { uploadToS3 } from "../aws/s3";
import crypto from "crypto";

/**
 * Generate a unique URI for a certificate
 * @param user The user to generate a certificate for
 */
export const generateCertificateUri = (user: IUser): string => {
  const hash = crypto
    .createHash("sha256")
    .update(`${user.digiLockerId}:${user.conferenceId}:${user.email}`)
    .digest("hex")
    .substring(0, 32);

  return `digilocker://operant/${hash}`;
};

/**
 * Generate a certificate for a user
 * @param user The user to generate a certificate for
 */
export const generateCertificate = async (
  user: IUser
): Promise<{ uri: string; s3Url: string }> => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Certificate for ${user.name}`,
      Author: "Operant DigiLocker System",
    },
  });

  // Set up the certificate content
  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .text("Certificate of Attendance", { align: "center" })
    .moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(18)
    .text("This is to certify that", { align: "center" })
    .moveDown(0.5);

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(user.name, { align: "center" })
    .moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(18)
    .text(`with Conference ID: ${user.conferenceId}`, { align: "center" })
    .moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(16)
    .text("has successfully attended the conference on", { align: "center" })
    .moveDown(0.5);

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(user.date.toLocaleDateString(), { align: "center" })
    .moveDown(2);

  doc
    .font("Helvetica-Oblique")
    .fontSize(12)
    .text(
      "This certificate is electronically generated and available in DigiLocker.",
      { align: "center" }
    )
    .moveDown(0.5);

  // Generate a unique certificate URI
  const certificateUri = generateCertificateUri(user);

  // Convert PDF to buffer
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  return new Promise<{ uri: string; s3Url: string }>((resolve, reject) => {
    doc.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const fileKey = `certificates/${user.digiLockerId}_${user.conferenceId}.pdf`;
        const s3Url = await uploadToS3(fileKey, buffer, "application/pdf");

        resolve({ uri: certificateUri, s3Url });
      } catch (error) {
        reject(error);
      }
    });

    // Finalize the PDF
    doc.end();
  });
};
