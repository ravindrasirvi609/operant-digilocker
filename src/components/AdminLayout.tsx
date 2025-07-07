import React from "react";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Certificates", href: "/admin/dashboard" },
  { label: "Upload", href: "/admin/dashboard" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:flex flex-col p-6">
        <div className="text-2xl font-bold mb-8 text-blue-700">Admin Panel</div>
        <nav className="flex-1">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 text-gray-700 font-medium"
                  onClick={() => router.push(item.href)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className="mt-8 px-3 py-2 rounded bg-red-100 text-red-700 font-semibold hover:bg-red-200"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
