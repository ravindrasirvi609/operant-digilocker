"use client";
import React, { useEffect, useState } from "react";

interface Certificate {
  name: string;
  collegeName: string;
  conferenceName: string;
  registrationId: string;
  conferenceDate: string;
  certificateType: string;
}

const issuer = "Operant DigiLocker | Conference Team";

export default function CertificateClient({ id }: { id: string }) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfMsg, setPdfMsg] = useState("");

  useEffect(() => {
    async function fetchCertificate() {
      const res = await fetch(`/api/certificates/${id}`);
      if (!res.ok) {
        setCert(null);
      } else {
        setCert(await res.json());
      }
      setLoading(false);
    }
    fetchCertificate();
  }, [id]);

  const downloadCertificatePDF = async (cert: Certificate) => {
    setPdfLoading(true);
    setPdfMsg("");
    const jsPDF = (await import("jspdf")).default;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Border
    doc.setDrawColor(60, 120, 216);
    doc.setLineWidth(4);
    doc.rect(24, 24, pageWidth - 48, pageHeight - 48, "S");

    // Title
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("Certificate of Participation", pageWidth / 2, 100, {
      align: "center",
    });

    // Subtitle
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`This is to certify that`, pageWidth / 2, 160, {
      align: "center",
    });

    // Name
    doc.setFontSize(28);
    doc.setFont("times", "bolditalic");
    doc.text(cert.name, pageWidth / 2, 200, { align: "center" });

    // College
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`from ${cert.collegeName}`, pageWidth / 2, 230, {
      align: "center",
    });

    // Conference
    doc.text(`participated in the conference:`, pageWidth / 2, 270, {
      align: "center",
    });
    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.text(cert.conferenceName, pageWidth / 2, 295, { align: "center" });

    // Registration ID and Certificate Type
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Registration ID: ${cert.registrationId}    |    Certificate Type: ${cert.certificateType}`,
      pageWidth / 2,
      340,
      { align: "center" }
    );

    // Conference Date
    doc.text(
      `Conference Date: ${new Date(cert.conferenceDate).toLocaleDateString()}`,
      pageWidth / 2,
      370,
      { align: "center" }
    );

    // Signature and Issuer
    doc.setFontSize(16);
    doc.setFont("helvetica", "italic");
    doc.text("________________________", pageWidth - 220, pageHeight - 120, {
      align: "center",
    });
    doc.text("Signature", pageWidth - 220, pageHeight - 100, {
      align: "center",
    });
    doc.setFont("helvetica", "bold");
    doc.text(issuer, 60, pageHeight - 60);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Issued on: ${new Date().toLocaleDateString()}`,
      pageWidth - 220,
      pageHeight - 60,
      { align: "center" }
    );

    doc.save(`certificate-${cert.registrationId}.pdf`);
    setPdfLoading(false);
    setPdfMsg("Download started!");
    setTimeout(() => setPdfMsg(""), 2000);
  };

  if (loading) return <div className="p-8">Loading certificate...</div>;
  if (!cert)
    return <div className="p-8 text-red-600">Certificate not found.</div>;

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Certificate Details
      </h1>
      <div className="mb-4 bg-white rounded shadow p-6 border border-blue-200">
        <div className="mb-2">
          <b>Name:</b> {cert.name}
        </div>
        <div className="mb-2">
          <b>College Name:</b> {cert.collegeName}
        </div>
        <div className="mb-2">
          <b>Conference Name:</b> {cert.conferenceName}
        </div>
        <div className="mb-2">
          <b>Registration ID:</b> {cert.registrationId}
        </div>
        <div className="mb-2">
          <b>Conference Date:</b>{" "}
          {new Date(cert.conferenceDate).toLocaleDateString()}
        </div>
        <div className="mb-2">
          <b>Certificate Type:</b> {cert.certificateType}
        </div>
      </div>
      <button
        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded shadow-lg font-semibold text-lg disabled:opacity-60"
        onClick={() => cert && downloadCertificatePDF(cert)}
        disabled={pdfLoading}
      >
        {pdfLoading ? "Generating PDF..." : "Download Certificate"}
      </button>
      {pdfMsg && <div className="mt-2 text-green-600">{pdfMsg}</div>}
    </main>
  );
}
