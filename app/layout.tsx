import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// アプリのメタデータ（タイトル、PWA設定など）
export const metadata: Metadata = {
  title: "Outer Cast | 今日のアウター予報",
  description: "気温と天気から、あなたに最適なアウターを提案します。",
  // PWA/ホーム画面インストールに必要な設定ファイル
  manifest: "/manifest.json", 
};

// layout.tsxはアプリ全体を囲むコンポーネントです
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // HTMLとBodyタグが必須
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}