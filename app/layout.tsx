import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Providers } from "./providers";
import "./globals.css";

const geist = localFont({
  src: "../public/fonts/geist-latin.woff2",
  weight: "100 900",
  display: "swap",
  variable: "--font-geist",
});

const themeInit = `(function(){try{if(localStorage.getItem('bm-theme')==='dark'){document.documentElement.dataset.theme='dark';}}catch(e){}})();`;

export const metadata: Metadata = {
  title: "Brightspace Manager",
  description: "Internal admin console for the LACE learning platform.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Brightspace Manager",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={geist.variable}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
