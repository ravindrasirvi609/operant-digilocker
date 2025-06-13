"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Certificate {
  name: string;
  certificateNumber: string;
  email: string;
  date: string;
  certificateUrl?: string;
}

export default function CertificateManager() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/view-data");
      const data = await response.json();

      if (data.success) {
        setCertificates(data.users);
      } else {
        toast.error(data.message || "Failed to fetch certificates");
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log(jsonData);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload-excel", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Certificates uploaded successfully");
          fetchCertificates();
        } else {
          toast.error(result.message || "Failed to upload certificates");
        }
      } catch (error) {
        console.error("Error processing Excel file:", error);
        toast.error("Failed to process Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Certificates</h2>
        <div className="flex gap-4">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button asChild>
              <span>Upload Excel</span>
            </Button>
          </label>
          <Button onClick={fetchCertificates} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {certificates.map((certificate) => (
          <Card key={certificate.certificateNumber}>
            <CardHeader>
              <CardTitle>{certificate.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Certificate Number:</span>{" "}
                  {certificate.certificateNumber}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {certificate.email}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(certificate.date).toLocaleDateString()}
                </p>
                {certificate.certificateUrl && (
                  <p>
                    <span className="font-semibold">Certificate:</span>{" "}
                    <a
                      href={certificate.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View Certificate
                    </a>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
