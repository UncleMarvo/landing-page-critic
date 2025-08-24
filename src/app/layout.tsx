import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ResultsProvider } from "@/context/ResultsContext";
import { AuthProvider } from "@/context/AuthContext";
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
  title: "Landing Page Critic - Performance Analysis Dashboard",
  description: "Analyze and optimize your landing pages with comprehensive performance metrics and AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ResultsProvider>{children}</ResultsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
