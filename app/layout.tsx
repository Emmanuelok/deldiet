import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://deldiet.vercel.app"),
  title: "Deldiet — The World in Your Cup",
  description:
    "Explore traceable coffee origins, build your exact cup, and bring the same coffee home in every format you brew.",
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: "Deldiet",
    title: "Deldiet — The World in Your Cup",
    description:
      "Explore traceable coffee origins, build your exact cup, and bring the same coffee home in every format you brew.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deldiet — The World in Your Cup",
    description:
      "Explore traceable coffee origins, build your exact cup, and bring the same coffee home in every format you brew.",
  },
  other: {
    "codex-preview": "development",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#17100c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
