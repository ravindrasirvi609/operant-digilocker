import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 p-8">
      <main className="flex flex-col gap-8 items-center w-full max-w-2xl">
        <Image
          className="dark:invert mb-4"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-blue-700 dark:text-blue-300 mb-2">
          Welcome to Operant DigiLocker
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-200 text-center mb-6">
          Securely manage, verify, and download your conference certificates.
          Admins can access the dashboard to manage certificates.
        </p>
        <Link
          href="/admin/dashboard"
          className="inline-block px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg transition-colors duration-200 mb-4"
        >
          Go to Dashboard
        </Link>
      </main>
    </div>
  );
}
