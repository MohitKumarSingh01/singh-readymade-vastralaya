import "./globals.css";
import type { Metadata } from "next";
import CursorGlow from "@/components/CursorGlow";

export const metadata: Metadata = {
  title: "Singh Readymade Vastralaya",
  description:
    "Fashion for men, women and kids — from daily essentials to festive wear and winter clothing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CursorGlow />
        {children}
      </body>
    </html>
  );
}
