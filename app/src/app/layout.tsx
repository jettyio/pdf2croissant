import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
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
                <Link
                  href="/about"
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  About
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
          <footer className="border-t border-gray-200 bg-white px-6 py-4 mt-auto">
            <div className="mx-auto flex max-w-4xl items-center justify-center">
              <a
                href="https://flows.jetty.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gray-600"
              >
                <img
                  src="/jetty-pelican.png"
                  alt="Jetty"
                  className="h-5 w-5 rounded-full"
                />
                Powered by Jetty
              </a>
            </div>
          </footer>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
