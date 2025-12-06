import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PoE SSF Tracker",
  description: "Track your Solo Self-Found progress in Path of Exile",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <QueryProvider>
          <nav className="border-b border-border bg-muted/50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
              <a href="/" className="font-bold text-lg">
                PoE SSF Tracker
              </a>
              <div className="flex gap-4 text-sm">
                <a href="/" className="hover:text-poe-unique">
                  Dashboard
                </a>
                <a href="/characters" className="hover:text-poe-unique">
                  Characters
                </a>
                <a href="/stash" className="hover:text-poe-unique">
                  Stash
                </a>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
