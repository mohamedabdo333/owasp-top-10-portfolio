import type { Metadata } from "next";

// Google-hosted font helpers. Geist is used for normal text; Geist Mono for technical labels.
import { Geist, Geist_Mono } from "next/font/google";

// Global stylesheet shared by every page in the site.
import "./globals.css";

// Loads the main sans-serif font and exposes it to CSS as --font-geist-sans.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Loads the monospace font used for IDs, labels, commands, and metadata.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Browser-tab and search/share metadata for the website.
export const metadata: Metadata = {
  title: "Mohamed Abdelwahab | OWASP Top 10 Field Notes",
  description:
    "A practical OWASP Top 10 portfolio by Mohamed Abdelwahab — explanations, repeatable testing checks, cheat sheets, and hands-on lab trails.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

// Root HTML wrapper shared by the whole application.
// It applies the font variables and renders the current page through `children`.
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
        {children}
      </body>
    </html>
  );
}
