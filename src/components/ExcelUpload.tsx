import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaRedo,
  FaUpload,
  FaFileExcel,
  FaTrash,
} from "react-icons/fa";

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
  const [lastUploadedCount, setLastUploadedCount] = useState<number | null>(
    null
  );
  const [fileName, setFileName] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);

  const validateData = (data: ParsedCertificate[]) => {
    const errors: string[] = [];

    data.forEach((row, index) => {
      if (!row.name || !row.name.trim()) {
        errors.push(`Row ${index + 1}: Name is required`);
      }
      if (!row.collegeName || !row.collegeName.trim()) {
        errors.push(`Row ${index + 1}: College Name is required`);
      }
      if (!row.conferenceName || !row.conferenceName.trim()) {
        errors.push(`Row ${index + 1}: Conference Name is required`);
      }
      if (!row.registrationId || !row.registrationId.trim()) {
        errors.push(`Row ${index + 1}: Registration ID is required`);
      }
    });

    return errors;
  };

  // Helper function to find column value with flexible matching
  const findColumnValue = (
    row: Record<string, unknown>,
    possibleNames: string[]
  ): string => {
    for (const name of possibleNames) {
      const value = row[name];
      if (value !== undefined && value !== null) {
        return String(value).trim();
      }
    }
    return "";
  };

  const processFile = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;

        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(
          sheet,
          {
            defval: "",
          }
        );

        console.log("Parsed JSON data:", json);
        console.log(
          "Available headers:",
          json.length > 0 ? Object.keys(json[0]) : []
        );

        // Map to our structure with more flexible column matching
        const mapped = json.map((row) => ({
          name: findColumnValue(row, [
            "name",
            "Name",
            "NAME",
            "Student Name",
            "student_name",
            "participant_name",
          ]),
          collegeName: findColumnValue(row, [
            "college Name",
            "College Name",
            "College name",
            "COLLEGE NAME",
            "CollegeName",
            "collegeName",
            "college_name",
            "Institution",
            "institution",
          ]),
          conferenceName: findColumnValue(row, [
            "conferenceName",
            "Conference Name",
            "Conference name",
            "CONFERENCE NAME",
            "ConferenceName",
            "conference_name",
            "Event Name",
            "event_name",
          ]),
          registrationId: findColumnValue(row, [
            "registrationId",
            "Registration ID",
            "Registration Id",
            "REGISTRATION ID",
            "RegistrationId",
            "registration_id",
            "Reg ID",
            "reg_id",
          ]),
          conferenceDate: findColumnValue(row, [
            "conferenceDate",
            "Conference Date",
            "Conference date",
            "CONFERENCE DATE",
            "ConferenceDate",
            "conference_date",
            "Event Date",
            "event_date",
          ]),
          certificateType: findColumnValue(row, [
            "certificateType",
            "Certificate Type",
            "Certificate type",
            "CERTIFICATE TYPE",
            "CertificateType",
            "certificate_type",
            "Type",
            "type",
          ]),
        }));

        console.log("Mapped data:", mapped);

        // Filter out completely empty rows
        const filteredMapped = mapped.filter(
          (row) =>
            row.name ||
            row.collegeName ||
            row.conferenceName ||
            row.registrationId
        );

        // Validate data
        const validationErrors = validateData(filteredMapped);
        if (validationErrors.length > 0) {
          setUploadError(
            `Validation errors: ${validationErrors.slice(0, 3).join(", ")}${
              validationErrors.length > 3 ? "..." : ""
            }`
          );
          return;
        }

        setParsedData(filteredMapped);
        setUploadSuccess(false);
        setUploadError("");
        setLastUploadedCount(null);
        setFileName(file.name);
      } catch (error) {
        setUploadError("Error parsing file. Please check the file format.");
        console.error("File parsing error:", error);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        processFile(file);
      } else {
        setUploadError("Please upload a valid Excel file (.xlsx or .xls)");
      }
    }
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
        setLastUploadedCount(parsedData.length);
        setParsedData([]); // Clear table, but keep summary
        setFileName("");
      } else {
        const data = await res.json();
        setUploadError(data.error || "Upload failed");
      }
    } catch (error: unknown) {
      console.log(error);
      setUploadError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setParsedData([]);
    setUploadSuccess(false);
    setUploadError("");
    setLastUploadedCount(null);
    setFileName("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">
        Upload Certificates (Excel)
      </h2>
      <div
        className={`border-2 border-dashed rounded-lg p-6 mb-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
            : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("excel-file-input")?.click()}
        tabIndex={0}
        role="button"
        aria-label="Upload Excel File"
      >
        <FaFileExcel className="text-4xl text-green-600 mb-2" />
        <span className="text-gray-800 dark:text-gray-100 font-medium">
          Drag & drop or click to select an Excel file
        </span>
        <input
          id="excel-file-input"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
        {fileName && (
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Selected: {fileName}
          </div>
        )}
      </div>
      {uploadError && (
        <div className="mb-4 p-3 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center gap-2">
          <FaExclamationCircle className="text-red-500 dark:text-red-300" />
          <span>{uploadError}</span>
        </div>
      )}
      {uploadSuccess && (
        <div className="mb-4 p-3 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center gap-2">
          <FaCheckCircle className="text-green-500 dark:text-green-300" />
          <span>Successfully uploaded {lastUploadedCount} certificates!</span>
        </div>
      )}
      <div className="flex gap-2 mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold transition-colors disabled:opacity-60"
          onClick={handleUpload}
          disabled={uploading || parsedData.length === 0}
        >
          <FaUpload />
          {uploading ? "Uploading..." : "Upload"}
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-semibold transition-colors"
          onClick={handleReset}
          disabled={uploading}
        >
          <FaRedo />
          Reset
        </button>
      </div>
      {parsedData.length > 0 && (
        <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Name
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  College Name
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Conference Name
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Registration ID
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Conference Date
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-900 dark:text-white">
                  Certificate Type
                </th>
                <th className="px-4 py-2 text-center font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {parsedData.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {row.collegeName}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {row.conferenceName}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {row.registrationId}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {row.conferenceDate}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {row.certificateType}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                      onClick={() => {
                        setParsedData(parsedData.filter((_, i) => i !== idx));
                      }}
                      title="Remove"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;
