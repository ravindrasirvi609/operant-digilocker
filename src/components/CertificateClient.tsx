"use client";
import React, { useEffect, useState } from "react";
import {
  Shield,
  Download,
  Calendar,
  User,
  Building,
  Award,
  Hash,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";

interface Certificate {
  name: string;
  collegeName: string;
  conferenceName: string;
  registrationId: string;
  conferenceDate: string;
  certificateType: string;
}

const issuer = "Operant Pharmacy Federation | Certificate Authority";

export default function CertificateClient({ id }: { id: string }) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfMsg, setPdfMsg] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function fetchCertificate() {
      const res = await fetch(`/api/certificates/${id}`);
      if (!res.ok) {
        setCert(null);
      } else {
        setCert(await res.json());
        setVerified(true);
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

    // Modern gradient background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Elegant border with gradient effect
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(3);
    doc.rect(40, 40, pageWidth - 80, pageHeight - 80, "S");

    // Inner decorative border
    doc.setDrawColor(147, 197, 253);
    doc.setLineWidth(1);
    doc.rect(50, 50, pageWidth - 100, pageHeight - 100, "S");

    // Header with logo placeholder
    doc.setFillColor(59, 130, 246);
    doc.rect(60, 60, pageWidth - 120, 60, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATE OF PARTICIPATION", pageWidth / 2, 100, {
      align: "center",
    });

    // Verification badge
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("✓ VERIFIED BY OPERANT PHARMACY FEDERATION", pageWidth / 2, 140, {
      align: "center",
    });

    // Main content
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("This is to certify that", pageWidth / 2, 180, {
      align: "center",
    });

    // Participant name with emphasis
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(32);
    doc.setFont("times", "bolditalic");
    doc.text(cert.name, pageWidth / 2, 220, { align: "center" });

    // Institution
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`from ${cert.collegeName}`, pageWidth / 2, 250, {
      align: "center",
    });

    // Conference details
    doc.text("has successfully participated in", pageWidth / 2, 290, {
      align: "center",
    });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(20);
    doc.setFont("times", "bold");
    doc.text(cert.conferenceName, pageWidth / 2, 320, { align: "center" });

    // Certificate details box
    doc.setFillColor(241, 245, 249);
    doc.rect(pageWidth / 2 - 200, 350, 400, 80, "F");
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(1);
    doc.rect(pageWidth / 2 - 200, 350, 400, 80, "S");

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Registration ID: ${cert.registrationId}`, pageWidth / 2, 370, {
      align: "center",
    });
    doc.text(`Certificate Type: ${cert.certificateType}`, pageWidth / 2, 390, {
      align: "center",
    });
    doc.text(
      `Conference Date: ${new Date(cert.conferenceDate).toLocaleDateString()}`,
      pageWidth / 2,
      410,
      { align: "center" }
    );

    // Footer section
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.text("_________________________", pageWidth - 180, pageHeight - 120, {
      align: "center",
    });
    doc.text("Authorized Signature", pageWidth - 180, pageHeight - 100, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.text(issuer, 80, pageHeight - 80);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Issued on: ${new Date().toLocaleDateString()}`,
      pageWidth - 180,
      pageHeight - 80,
      { align: "center" }
    );

    doc.save(`${cert.name.replace(/\s+/g, "_")}_Certificate.pdf`);
    setPdfLoading(false);
    setPdfMsg("Certificate downloaded successfully!");
    setTimeout(() => setPdfMsg(""), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Verifying certificate...
          </p>
        </div>
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-red-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-4">
            Certificate Not Found
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-6">
            The certificate you&apos;re looking for could not be verified or
            does not exist in our system.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-lg border-b border-blue-100 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Certificate Verification
                </h1>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Operant Pharmacy Federation
                </p>
              </div>
            </div>
            {verified && (
              <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 font-medium">
                  Verified
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Certificate Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-blue-100 dark:border-slate-700">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Certificate of Participation
              </h2>
              <p className="text-blue-100">
                Verified by Operant Pharmacy Federation
              </p>
            </div>

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {cert.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {cert.collegeName}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-slate-700 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Conference Details
                </h4>
                <p className="text-blue-700 dark:text-blue-300 font-medium">
                  {cert.conferenceName}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(cert.conferenceDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {cert.registrationId}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {cert.certificateType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <User className="w-6 h-6 text-blue-600 mr-3" />
                Participant Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Full Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {cert.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Institution
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-500" />
                    {cert.collegeName}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-blue-100 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Award className="w-6 h-6 text-blue-600 mr-3" />
                Certificate Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Conference Name
                  </label>
                  <p className="text-gray-700 dark:text-gray-300">
                    {cert.conferenceName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Registration ID
                    </label>
                    <p className="text-gray-700 dark:text-gray-300 font-mono text-sm">
                      {cert.registrationId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Certificate Type
                    </label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {cert.certificateType}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Conference Date
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    {new Date(cert.conferenceDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Download className="w-6 h-6 mr-3" />
                Download Certificate
              </h3>
              <p className="text-blue-100 mb-6">
                Download your verified certificate in PDF format with official
                verification seal.
              </p>
              <button
                onClick={() => downloadCertificatePDF(cert)}
                disabled={pdfLoading}
                className="w-full bg-white text-blue-600 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                {pdfLoading ? (
                  <>
                    <Clock className="w-5 h-5 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Certificate</span>
                  </>
                )}
              </button>
              {pdfMsg && (
                <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {pdfMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-slate-800 border-t border-blue-100 dark:border-slate-700 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Certificate issued and verified by
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-semibold">
              Operant Pharmacy Federation
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Issued on: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
