import "./globals.css";
import type { Metadata } from "next";
import { CursorGlow } from "@/components/CursorGlow";

export const metadata: Metadata = {
  title: "Singh Readymade Vastralaya",
  description: "Men's, women's and kids' fashion — everyday wear, ethnic wear and winter collections."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><CursorGlow />{children}</body>
    </html>
  );
}
