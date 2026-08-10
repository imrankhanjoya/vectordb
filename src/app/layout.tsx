import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vector DB",
  description: "Vector search with MongoDB Atlas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
          <nav className="mx-auto flex max-w-4xl items-center gap-6 px-6 py-3">
            <Link
              href="/"
              className="font-semibold text-zinc-900 dark:text-zinc-50"
            >
              VectorDB
            </Link>
            <div className="flex gap-4 text-sm font-medium">
              <Link
                href="/insert"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Insert
              </Link>
              <Link
                href="/list"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                List
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
