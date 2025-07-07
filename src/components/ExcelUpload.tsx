import React, { useState } from "react";
import * as XLSX from "xlsx";

interface ParsedCertificate {
  name: string;
  collegeName: string;
  conferenceName: string;
  registrationId: string;
  conferenceDate: string;
  certificateType: string;
}

const ExcelUpload: React.FC = () => {
  const [parsedData, setParsedData] = useState<ParsedCertificate[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });
      // Map to our structure
      const mapped = json.map((row) => ({
        name: (row["Name"] as string) || "",
        collegeName:
          (row["College name"] as string) ||
          (row["CollegeName"] as string) ||
          "",
        conferenceName:
          (row["Conference name"] as string) ||
          (row["ConferenceName"] as string) ||
          "",
        registrationId:
          (row["Registration id"] as string) ||
          (row["RegistrationId"] as string) ||
          "",
        conferenceDate:
          (row["Conference date"] as string) ||
          (row["ConferenceDate"] as string) ||
          "",
        certificateType:
          (row["Certificate type"] as string) ||
          (row["CertificateType"] as string) ||
          "",
      }));
      setParsedData(mapped);
      setUploadSuccess(false);
      setUploadError("");
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData),
      });
      if (res.ok) {
        setUploadSuccess(true);
        setParsedData([]);
      } else {
        const data = await res.json();
        setUploadError(data.error || "Upload failed");
      }
    } catch {
      setUploadError("Network error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium">Upload Excel File</label>
      <input
        type="file"
        accept=".xlsx, .xls"
        className="mb-2"
        onChange={handleFileChange}
      />
      {parsedData.length > 0 && (
        <>
          <div className="overflow-x-auto mb-2">
            <table className="min-w-full border text-xs">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">College Name</th>
                  <th className="border px-2 py-1">Conference Name</th>
                  <th className="border px-2 py-1">Registration ID</th>
                  <th className="border px-2 py-1">Conference Date</th>
                  <th className="border px-2 py-1">Certificate Type</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{row.name}</td>
                    <td className="border px-2 py-1">{row.collegeName}</td>
                    <td className="border px-2 py-1">{row.conferenceName}</td>
                    <td className="border px-2 py-1">{row.registrationId}</td>
                    <td className="border px-2 py-1">{row.conferenceDate}</td>
                    <td className="border px-2 py-1">{row.certificateType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload to Database"}
          </button>
        </>
      )}
      {uploadError && <div className="text-red-600 mt-2">{uploadError}</div>}
      {uploadSuccess && (
        <div className="text-green-600 mt-2">Upload successful!</div>
      )}
    </div>
  );
};

export default ExcelUpload;
