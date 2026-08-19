import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import VisitorTracker from "@/components/VisitorTracker";
import SessionTimeout from "@/components/auth/SessionTimeout";

export const metadata: Metadata = {
  title: "Fortuna Play",
  description: "Play. Win. Celebrate.",
  applicationName: "Fortuna Play",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fortuna Play",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5B700",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <VisitorTracker />
        <SessionTimeout />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
