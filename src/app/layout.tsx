import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "סייען זכויות - מבצע שאגת הארי",
  description: "בדיקת זכאות לקצבאות ביטוח לאומי בעקבות מבצע שאגת הארי",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
