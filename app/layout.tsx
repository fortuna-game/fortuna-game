import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import VisitorTracker from "@/components/VisitorTracker";

export const metadata: Metadata = {
  title: "Fortuna Play",
  description: "Play. Win. Celebrate.",
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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
