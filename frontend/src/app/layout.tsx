import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "FoundIt - Localized Lost & Found Network",
  description: "Report lost items and find what's been found in your neighborhood. A community-powered lost and found platform with real-time geolocation.",
  keywords: "lost and found, missing items, community, geolocation, neighborhood",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen antialiased relative">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="soft-grid absolute inset-x-0 top-0 h-[720px] opacity-80" />
          <div className="absolute -top-48 left-[8%] h-96 w-96 rounded-full bg-indigo-200/45 blur-3xl" />
          <div className="absolute top-28 right-[4%] h-80 w-80 rounded-full bg-emerald-100/55 blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
