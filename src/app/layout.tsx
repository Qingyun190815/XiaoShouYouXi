import type { Metadata } from "next";
import { GameProvider } from "@/context/GameContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "文字探险游戏",
  description: "分支叙事型文字冒险游戏平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
