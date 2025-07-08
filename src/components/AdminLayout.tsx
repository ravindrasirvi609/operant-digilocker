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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-sm hidden md:flex flex-col p-6">
        <div className="text-2xl font-bold mb-8 text-blue-700 dark:text-blue-300">
          Admin Panel
        </div>
        <nav className="flex-1">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  className="w-full text-left px-3 py-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-100 font-medium"
                  onClick={() => router.push(item.href)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className="mt-8 px-3 py-2 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-semibold hover:bg-red-200 dark:hover:bg-red-700"
          onClick={handleLogout}
        >
          Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </main>
    </div>
  );
}
