import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "HireRent — Find Trusted Professionals",
    template: "%s | HireRent",
  },
  description:
    "Multi-service marketplace for hiring and renting professionals. Compare offers, book instantly, and pay securely with escrow protection.",
  keywords: ["hiring", "services", "marketplace", "professionals", "booking"],
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
      </head>
      <body className="min-h-screen bg-background antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
