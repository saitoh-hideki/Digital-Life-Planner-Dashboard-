import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digital Life Planner Dashboard",
  description: "Your Hub for Learning, Planning, and Acting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Digital Life Planner Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Your Hub for Learning, Planning, and Acting
              </p>
            </div>
          </div>
        </header>
        <main className="min-h-screen bg-gray-50 pt-24">
          {children}
        </main>
      </body>
    </html>
  );
}
