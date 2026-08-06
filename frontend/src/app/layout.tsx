import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "HireRent — Hire Trusted Professionals",
    template: "%s | HireRent",
  },
  description:
    "Multi-service marketplace for hiring and renting professionals. Compare offers by price, distance, and rating. Book instantly or post a job for custom quotes — with AI-powered matching and escrow-protected payments.",
  keywords: ["hiring", "services", "marketplace", "professionals", "booking", "escrow"],
  authors: [{ name: "HireRent" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DM Sans — display/headlines */}
        {/* IBM Plex Sans — body/labels */}
        {/* IBM Plex Sans Arabic — Arabic typography */}
        {/* IBM Plex Mono — numeric data: prices, scores, codes, countdowns */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
