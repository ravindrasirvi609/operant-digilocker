import React, { useEffect, useState } from "react";

interface Certificate {
  _id: string;
  name: string;
  collegeName: string;
  conferenceName: string;
  registrationId: string;
  conferenceDate: string;
  certificateType: string;
}

const CertificateTable: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Certificate>>({});
  const [search, setSearch] = useState("");

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

  if (loading) return <div>Loading certificates...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search by name, registration ID, or college name..."
          className="border px-2 py-1 rounded w-full max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table className="min-w-full border mt-4">
        <thead>
          <tr>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">College Name</th>
            <th className="border px-2 py-1">Conference Name</th>
            <th className="border px-2 py-1">Registration ID</th>
            <th className="border px-2 py-1">Conference Date</th>
            <th className="border px-2 py-1">Certificate Type</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCertificates.map((cert) => (
            <tr key={cert._id}>
              {editingId === cert.registrationId ? (
                <>
                  <td className="border px-2 py-1">
                    <input
                      name="name"
                      value={editData.name || ""}
                      onChange={handleEditChange}
                      className="border px-1 py-0.5 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      name="collegeName"
                      value={editData.collegeName || ""}
                      onChange={handleEditChange}
                      className="border px-1 py-0.5 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      name="conferenceName"
                      value={editData.conferenceName || ""}
                      onChange={handleEditChange}
                      className="border px-1 py-0.5 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">{cert.registrationId}</td>
                  <td className="border px-2 py-1">
                    <input
                      name="conferenceDate"
                      value={editData.conferenceDate || ""}
                      onChange={handleEditChange}
                      className="border px-1 py-0.5 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      name="certificateType"
                      value={editData.certificateType || ""}
                      onChange={handleEditChange}
                      className="border px-1 py-0.5 rounded w-full"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                      onClick={handleEditSave}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-400 text-white px-2 py-1 rounded"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border px-2 py-1">{cert.name}</td>
                  <td className="border px-2 py-1">{cert.collegeName}</td>
                  <td className="border px-2 py-1">{cert.conferenceName}</td>
                  <td className="border px-2 py-1">{cert.registrationId}</td>
                  <td className="border px-2 py-1">
                    {new Date(cert.conferenceDate).toLocaleDateString()}
                  </td>
                  <td className="border px-2 py-1">{cert.certificateType}</td>
                  <td className="border px-2 py-1">
                    <button
                      className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleEdit(cert)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(cert.registrationId)}
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CertificateTable;
