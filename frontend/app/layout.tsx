import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Sidebar from "../components/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "AI Command Center — Lead Qualification",
  description: "Advanced Developer Dashboard for testing and observing the AI Lead Qualification agent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`} style={{ height: "100%", margin: 0, display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
