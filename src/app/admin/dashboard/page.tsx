"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ExcelUpload from "@/components/ExcelUpload";
import CertificateTable from "@/components/CertificateTable";

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.replace("/admin/login");
      }
    }
  }, [router]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <ExcelUpload />
      <div className="mt-8">
        <CertificateTable />
      </div>
    </main>
  );
}
