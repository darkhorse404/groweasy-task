import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Lead Qualifier — AI WhatsApp Bot",
  description:
    "An AI-driven lead qualification chatbot that simulates WhatsApp conversations, extracts metadata, and classifies leads as Hot, Cold, or Invalid.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body className={`${geist.variable} antialiased`} style={{ height: "100%", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
