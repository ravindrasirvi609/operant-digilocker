"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const AdminLoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("admin_token", data.token);
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="max-w-sm mx-auto p-4 border rounded shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Admin Login
      </h2>
      <div className="mb-4">
        <label className="block mb-1 text-gray-900 dark:text-gray-100">
          Username
        </label>
        <input
          type="text"
          name="username"
          className="w-full border px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-gray-900 dark:text-gray-100">
          Password
        </label>
        <input
          type="password"
          name="password"
          className="w-full border px-2 py-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>
      )}
      <button
        type="submit"
        className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default AdminLoginForm;
