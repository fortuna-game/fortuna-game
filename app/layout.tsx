import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import VisitorTracker from "@/components/VisitorTracker";
import SessionTimeout from "@/components/auth/SessionTimeout";

export const metadata: Metadata = {
  title: "Fortuna Play",
  description: "Play. Win. Celebrate.",
  applicationName: "Fortuna Play",

  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fortuna Play",
  },
};

export const viewport: Viewport = {
  themeColor: "#07111F",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
      </head>
      <body className="bg-fortuna-navy text-white">
        <VisitorTracker />
        <SessionTimeout />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
