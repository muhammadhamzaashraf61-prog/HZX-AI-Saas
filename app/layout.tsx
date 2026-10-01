import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aivora — Your AI Workspace",
  description: "Create, analyze and automate with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}