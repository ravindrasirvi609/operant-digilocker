import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

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
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-blue-600">Loading certificates...</span>
      </div>
    );
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded shadow border border-blue-100 p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search by name, registration ID, or college name..."
          className="border px-3 py-2 rounded w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 mt-2 md:mt-0">
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={fetchCertificates}
          >
            Refresh
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                College Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Conference Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Registration ID
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Conference Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Certificate Type
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCertificates.map((cert) => (
              <tr
                key={cert._id}
                className="hover:bg-blue-50 transition border-b last:border-b-0"
              >
                {editingId === cert.registrationId ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        name="name"
                        value={editData.name || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="collegeName"
                        value={editData.collegeName || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="conferenceName"
                        value={editData.conferenceName || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">{cert.registrationId}</td>
                    <td className="px-4 py-2">
                      <input
                        name="conferenceDate"
                        value={editData.conferenceDate || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        name="certificateType"
                        value={editData.certificateType || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                        onClick={handleEditSave}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2">{cert.name}</td>
                    <td className="px-4 py-2">{cert.collegeName}</td>
                    <td className="px-4 py-2">{cert.conferenceName}</td>
                    <td className="px-4 py-2">{cert.registrationId}</td>
                    <td className="px-4 py-2">
                      {new Date(cert.conferenceDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{cert.certificateType}</td>
                    <td className="px-4 py-2 text-center flex gap-2 justify-center">
                      <button
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        title="Edit"
                        onClick={() => handleEdit(cert)}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
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
                <td colSpan={7} className="text-center py-8 text-gray-400">
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
            className="px-3 py-1 rounded border bg-white hover:bg-blue-50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded border ${
                page === i + 1
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-blue-50"
              }`}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 rounded border bg-white hover:bg-blue-50 disabled:opacity-50"
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
