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
    <html lang="en" className="h-full">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased flex h-full m-0`}>
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden relative min-w-0">
          {children}
        </main>
      </body>
    </html>
  );
}
