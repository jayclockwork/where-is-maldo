import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeRegistry } from "@/theme/ThemeRegistry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Journey Mapping",
  description: "An LLM addoption journey mapping site.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeRegistry>
          <div className="app-shell">
            <main className="app-shell-main">{children}</main>
            <SiteFooter />
          </div>
        </ThemeRegistry>
        <Analytics />
      </body>
    </html>
  );
}
