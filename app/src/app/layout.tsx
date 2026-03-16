import type { Metadata } from "next";
import Link from "next/link";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF to Croissant",
  description:
    "Generate MLCommons Croissant JSON-LD metadata from academic papers using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <header className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="text-lg font-semibold tracking-tight text-gray-900"
                >
                  <span className="text-sky-600">Croissant</span> Generator
                </Link>
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-600">
                  MLCommons
                </span>
              </div>
              <nav className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  Generate
                </Link>
                <Link
                  href="/runbook"
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  Runbook
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
