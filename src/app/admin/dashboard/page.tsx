"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExcelUpload from "@/components/ExcelUpload";
import CertificateTable from "@/components/CertificateTable";
import AdminLayout from "@/components/AdminLayout";
import {
  FaCertificate,
  FaUpload,
  FaChartBar,
  FaCalendarAlt,
  FaUsers,
  FaFileExcel,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

interface DashboardStats {
  totalCertificates: number;
  recentUploads: number;
  activeUsers: number;
  lastUploadDate: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.replace("/admin/login");
        return;
      }
      setIsAuthenticated(true);
    }

    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch certificates data
        const certificatesRes = await fetch("/api/certificates");
        if (!certificatesRes.ok) {
          throw new Error("Failed to fetch certificates");
        }
        const certificatesData = await certificatesRes.json();

        // Calculate stats (you can enhance this with actual API endpoints)
        const totalCertificates = certificatesData.length;
        const recentUploads = certificatesData.filter((cert: any) => {
          const uploadDate = new Date(
            cert.createdAt || cert.uploadDate || Date.now()
          );
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return uploadDate > sevenDaysAgo;
        }).length;

        // Mock data for demonstration - replace with actual API calls
        const activeUsers = Math.floor(Math.random() * 50) + 10;
        const lastUploadDate =
          certificatesData.length > 0
            ? new Date(
                certificatesData[0].createdAt || Date.now()
              ).toLocaleDateString()
            : "No uploads yet";

        setStats({
          totalCertificates,
          recentUploads,
          activeUsers,
          lastUploadDate,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [router, isAuthenticated]);

  const refreshStats = () => {
    if (isAuthenticated) {
      setStats(null);
      setLoading(true);
      // Re-trigger the useEffect by changing a dependency
      window.location.reload();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage certificates and monitor system activity
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={refreshStats}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FaChartBar className="mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Certificates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Certificates
                </p>
                <div className="mt-2">
                  {loading ? (
                    <div className="flex items-center">
                      <FaSpinner className="animate-spin text-blue-500 mr-2" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="text-red-500 text-sm flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      Error
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats?.totalCertificates?.toLocaleString() || "0"}
                    </p>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FaCertificate className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Recent Uploads
                </p>
                <div className="mt-2">
                  {loading ? (
                    <div className="flex items-center">
                      <FaSpinner className="animate-spin text-green-500 mr-2" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="text-red-500 text-sm flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      Error
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats?.recentUploads?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Last 7 days
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FaUpload className="text-green-600 dark:text-green-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
                <div className="mt-2">
                  {loading ? (
                    <div className="flex items-center">
                      <FaSpinner className="animate-spin text-purple-500 mr-2" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="text-red-500 text-sm flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      Error
                    </div>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats?.activeUsers?.toLocaleString() || "0"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This month
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FaUsers className="text-purple-600 dark:text-purple-400 text-xl" />
              </div>
            </div>
          </div>

          {/* Last Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Last Upload
                </p>
                <div className="mt-2">
                  {loading ? (
                    <div className="flex items-center">
                      <FaSpinner className="animate-spin text-orange-500 mr-2" />
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="text-red-500 text-sm flex items-center">
                      <FaExclamationTriangle className="mr-1" />
                      Error
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stats?.lastUploadDate || "Never"}
                    </p>
                  )}
                </div>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <FaCalendarAlt className="text-orange-600 dark:text-orange-400 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error Loading Dashboard Data
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
              <FaFileExcel className="text-blue-600 dark:text-blue-400 mr-3 text-xl" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  Upload Excel
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bulk import certificates
                </p>
              </div>
            </button>

            <button className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group">
              <FaCertificate className="text-green-600 dark:text-green-400 mr-3 text-xl" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  View Certificates
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse all certificates
                </p>
              </div>
            </button>

            <button className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group">
              <FaChartBar className="text-purple-600 dark:text-purple-400 mr-3 text-xl" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  Analytics
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View detailed reports
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Excel Upload Component */}
        <ExcelUpload />

        {/* Certificate Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Certificate Management
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View and manage all certificates in the system
            </p>
          </div>
          <div className="p-6">
            <CertificateTable />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
