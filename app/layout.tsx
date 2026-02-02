import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/homepage.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chin:Aakha",
  description: "- RANDOM FEELINGS PUT INTO WORDS -",
  icons: {
    icon: "/images/logos/favicon.ico",
    apple: "/images/logos/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/images/logos/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/images/logos/favicon-16x16.png",
      },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chin:Aakha",
  },
  metadataBase: new URL('https://chinaakha.vercel.app'),
  openGraph: {
    type: "website",
    url: "https://chinaakha.vercel.app",
    title: "Chin:Aakha",
    description: "RANDOM FEELINGS PUT INTO WORDS",
    siteName: "Chin:Aakha",
    locale: "en_US",
    images: [
      {
        url: "https://chinaakha.vercel.app/images/logos/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Chin:Aakha Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chin:Aakha",
    description: "RANDOM FEELINGS PUT INTO WORDS",
    images: ["https://chinaakha.vercel.app/images/logos/android-chrome-512x512.png"],
  },
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
        {children}
      </body>
    </html>
  );
}
