import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSync, FaMoon, FaSun } from "react-icons/fa";

interface Certificate {
  _id: string;
  name: string;
  collegeName: string;
  conferenceName: string;
  registrationId: string;
  conferenceDate: string;
  certificateType: string;
}

const PAGE_SIZE = 10;

const CertificateTable: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Certificate>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user prefers dark mode or had it previously set
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return savedTheme === "dark" || (!savedTheme && prefersDark);
    }
    return false;
  });

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const fetchCertificates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/certificates");
      if (!res.ok) throw new Error("Failed to fetch certificates");
      const data = await res.json();
      setCertificates(data);
    } catch {
      console.error("Error loading certificates");
      setError("Error loading certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleDelete = async (registrationId: string) => {
    if (!window.confirm("Are you sure you want to delete this certificate?"))
      return;
    try {
      const res = await fetch(`/api/certificates/${registrationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchCertificates();
    } catch {
      alert("Error deleting certificate");
    }
  };

  const handleEdit = (cert: Certificate) => {
    setEditingId(cert.registrationId);
    setEditData({ ...cert });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/certificates/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingId(null);
      setEditData({});
      fetchCertificates();
    } catch {
      alert("Error updating certificate");
    }
  };

  // Filter certificates by search
  const filteredCertificates = certificates.filter((cert) => {
    const q = search.toLowerCase();
    return (
      cert.name.toLowerCase().includes(q) ||
      cert.registrationId.toLowerCase().includes(q) ||
      cert.collegeName.toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredCertificates.length / PAGE_SIZE);
  const paginatedCertificates = filteredCertificates.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [totalPages]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-4 text-primary dark:text-primary-dark">
          Loading certificates...
        </span>
      </div>
    );

  if (error)
    return (
      <div className="text-error dark:text-error-dark p-4 rounded-md bg-error-bg dark:bg-error-bg-dark">
        {error}
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-4 transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search by name, registration ID, or college name..."
            className="border dark:border-gray-600 px-3 py-2 rounded-md w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={toggleTheme}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-700" />
            )}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover text-white font-medium transition-colors"
            onClick={fetchCertificates}
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-200 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                College Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Conference Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Registration ID
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Conference Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                Certificate Type
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedCertificates.map((cert) => (
              <tr
                key={cert._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-750/50 transition-colors"
              >
                {editingId === cert.registrationId ? (
                  <>
                    <td className="px-4 py-3">
                      <input
                        name="name"
                        value={editData.name || ""}
                        onChange={handleEditChange}
                        className="border dark:border-gray-600 px-2 py-1 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        name="collegeName"
                        value={editData.collegeName || ""}
                        onChange={handleEditChange}
                        className="border dark:border-gray-600 px-2 py-1 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        name="conferenceName"
                        value={editData.conferenceName || ""}
                        onChange={handleEditChange}
                        className="border dark:border-gray-600 px-2 py-1 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {cert.registrationId}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        name="conferenceDate"
                        value={editData.conferenceDate || ""}
                        onChange={handleEditChange}
                        className="border dark:border-gray-600 px-2 py-1 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        type="date"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        name="certificateType"
                        value={editData.certificateType || ""}
                        onChange={handleEditChange}
                        className="border dark:border-gray-600 px-2 py-1 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-3 py-1 rounded mr-2 transition-colors"
                        onClick={handleEditSave}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 text-white px-3 py-1 rounded transition-colors"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {cert.name}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {cert.collegeName}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {cert.conferenceName}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {cert.registrationId}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {new Date(cert.conferenceDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {cert.certificateType}
                    </td>
                    <td className="px-4 py-3 text-center flex gap-2 justify-center">
                      <button
                        className="bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-dark-hover text-white p-2 rounded hover:shadow-md transition-all"
                        title="Edit"
                        onClick={() => handleEdit(cert)}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        className="bg-error hover:bg-error-hover dark:bg-error-dark dark:hover:bg-error-dark-hover text-white p-2 rounded hover:shadow-md transition-all"
                        title="Delete"
                        onClick={() => handleDelete(cert.registrationId)}
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {paginatedCertificates.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-gray-500 dark:text-gray-400 italic"
                >
                  No certificates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-md border ${
                page === i + 1
                  ? "bg-primary dark:bg-primary-dark text-white border-primary dark:border-primary-dark"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              } transition-colors`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificateTable;
