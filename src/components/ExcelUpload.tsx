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
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
          <FaFileExcel className="mr-2 text-green-600" />
          Excel File Upload
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload your Excel file with certificate data. Supported formats:
          .xlsx, .xls
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <FaUpload className="text-2xl text-gray-400 dark:text-gray-300" />
          </div>

          <div>
            <label className="cursor-pointer">
              <span className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Click to upload
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {" "}
                or drag and drop
              </span>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Required columns: Name, College Name, Conference Name, Registration
            ID, Conference Date, Certificate Type
          </div>
        </div>
      </div>

      {/* File Info */}
      {fileName && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <FaFileExcel className="text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {fileName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              ({parsedData.length} records)
            </span>
          </div>
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <FaTrash />
          </button>
        </div>
      )}

      {/* Data Table */}
      {parsedData.length > 0 ? (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white">
              Preview Data ({parsedData.length} records)
            </h4>
          </div>

          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      College Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Conference Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Registration ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Conference Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Certificate Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {parsedData.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {row.name || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {row.collegeName || (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {row.conferenceName || (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {row.registrationId || (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {row.conferenceDate || (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {row.certificateType || (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Upload to Database
                </>
              )}
            </button>

            <button
              className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              onClick={handleReset}
              disabled={uploading}
            >
              <FaRedo className="mr-2" />
              Clear Data
            </button>
          </div>
        </div>
      ) : (
        !fileName && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 mt-4">
            <FaFileExcel className="mx-auto text-3xl mb-2 text-gray-300 dark:text-gray-600" />
            <p>No file selected. Upload an Excel file to get started.</p>
          </div>
        )
      )}

      {/* Status Messages */}
      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <FaExclamationCircle className="mr-2 flex-shrink-0" />
            <span className="text-sm">{uploadError}</span>
          </div>
        </div>
      )}

      {uploadSuccess && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center text-green-700 dark:text-green-400">
            <FaCheckCircle className="mr-2 flex-shrink-0" />
            <span className="text-sm">
              Upload successful!
              {lastUploadedCount !== null && (
                <span className="ml-2 font-medium">
                  {lastUploadedCount} records uploaded
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelUpload;
