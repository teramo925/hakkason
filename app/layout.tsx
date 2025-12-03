import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// ▼ ここを書き換える
export const metadata: Metadata = {
  title: "Outer Cast | 今日のアウター予報",
  description: "気温と天気から、あなたに最適なアウターを提案します。",
  manifest: "/manifest.json", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}