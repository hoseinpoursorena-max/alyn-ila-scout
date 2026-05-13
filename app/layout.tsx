import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALYN ILA Scout",
  description: "Internal ALYN field notes app for ILA Berlin"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
