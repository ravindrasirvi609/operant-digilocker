import AdminLoginForm from "@/components/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-100 dark:border-slate-700 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-300">
          Admin Login
        </h1>
        <AdminLoginForm />
      </div>
    </main>
  );
}
