"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Certificate {
  name: string;
  certificateNumber: string;
  email: string;
  date: string;
  certificateUrl?: string;
}

export default function CertificateSearch() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!certificateNumber.trim()) {
      toast.error("Please enter a certificate number");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search-certificate?certificateNumber=${encodeURIComponent(
          certificateNumber
        )}`
      );
      const data = await response.json();

      if (data.success) {
        setCertificate(data.certificate);
      } else {
        toast.error(data.message || "Certificate not found");
        setCertificate(null);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to search certificate";
      toast.error(errorMessage);
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Enter certificate number"
          value={certificateNumber}
          onChange={(e) => setCertificateNumber(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {certificate && (
        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Name</p>
                <p>{certificate.name}</p>
              </div>
              <div>
                <p className="font-semibold">Certificate Number</p>
                <p>{certificate.certificateNumber}</p>
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p>{certificate.email}</p>
              </div>
              <div>
                <p className="font-semibold">Date</p>
                <p>{new Date(certificate.date).toLocaleDateString()}</p>
              </div>
              {certificate.certificateUrl && (
                <div>
                  <p className="font-semibold">Certificate</p>
                  <a
                    href={certificate.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Certificate
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
