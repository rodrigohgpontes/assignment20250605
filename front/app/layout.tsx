import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "../lib/react-query";
import { ClientToastContainer } from "../components/ui/ClientToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helium Localization Manager",
  description: "Manage your application's translation keys and values across different languages. A professional localization management tool built with Next.js and FastAPI.",
  keywords: ["localization", "translation", "i18n", "internationalization", "language management"],
  authors: [{ name: "Helium Assignment" }],
  openGraph: {
    title: "Helium Localization Manager",
    description: "Professional localization management tool for managing translation keys and values",
    type: "website",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ReactQueryProvider>
          {children}
          <ClientToastContainer />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
