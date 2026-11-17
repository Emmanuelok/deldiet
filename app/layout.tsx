import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaRegistration from "./pwa-registration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.deldiet.coffee"),
  title: "Deldiet — The World in Your Cup",
  manifest: "/manifest.webmanifest",
  applicationName: "Deldiet",
  appleWebApp: { capable: true, title: "Deldiet", statusBarStyle: "default" },
  openGraph: {
    type: "website", siteName: "Deldiet", locale: "en_CA",
    title: "Deldiet — The World in Your Cup",
    description: "Explore coffee origins and discover your next daily ritual.",
    images: [{ url: "/brand/og-deldiet.png", width: 1200, height: 630, alt: "Deldiet — The world in your cup. Coffee, without borders." }],
  },
  twitter: { card: "summary_large_image", title: "Deldiet — The World in Your Cup", description: "Explore coffee origins and discover your next daily ritual.", images: ["/brand/og-deldiet.png"] },
  description:
    "Explore traceable coffee origins, build your exact cup, and bring the same coffee home in every format you brew.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.svg",
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
        <PwaRegistration />
      </body>
    </html>
  );
}
