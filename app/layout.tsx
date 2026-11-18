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

const socialPreviewImage = {
  url: "/brand/crimson/espresso-pour.jpg",
  width: 1200,
  height: 630,
  type: "image/jpeg",
  alt: "Espresso pours into a glass cup against a crimson background beside the Deldiet logo and the words “The world in your cup.”",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.deldiet.coffee"),
  title: "Deldiet — The World in Your Cup",
  manifest: "/manifest.webmanifest?v=crimson",
  applicationName: "Deldiet",
  appleWebApp: { capable: true, title: "Deldiet", statusBarStyle: "default" },
  openGraph: {
    type: "website", siteName: "Deldiet", locale: "en_CA",
    title: "Deldiet — The World in Your Cup",
    description: "Explore coffee origins and discover your next daily ritual.",
    images: [socialPreviewImage],
  },
  twitter: { card: "summary_large_image", title: "Deldiet — The World in Your Cup", description: "Explore coffee origins and discover your next daily ritual.", images: [socialPreviewImage] },
  description:
    "Explore traceable coffee origins, build your exact cup, and bring the same coffee home in every format you brew.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: [
      { url: "/brand/crimson/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/crimson/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/crimson/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/crimson/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/brand/crimson/icon-180.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/brand/crimson/favicon.ico",
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
