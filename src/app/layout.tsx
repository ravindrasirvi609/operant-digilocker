import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Operant DigiLocker Admin",
  description: "Admin dashboard for DigiLocker certificate management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-primary text-primary-foreground p-4">
          <div className="container max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">Operant DigiLocker Admin</h1>
          </div>
        </header>
        <main className="container max-w-7xl mx-auto p-4">
          {children}
          <Toaster />
        </main>
      </body>
    </html>
  );
}
