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
      <body className="min-h-screen bg-slate-50 antialiased relative">
        {/* Global Animated Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/40 blur-3xl animate-blob mix-blend-multiply" />
          <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-400/40 blur-3xl animate-blob animation-delay-2000 mix-blend-multiply" />
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-400/40 blur-3xl animate-blob animation-delay-4000 mix-blend-multiply" />
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
