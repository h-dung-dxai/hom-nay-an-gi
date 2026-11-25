import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const font = Be_Vietnam_Pro({ subsets: ["vietnamese", "latin"], weight: ["400", "600", "800"] });

export const metadata: Metadata = {
  title: "Hôm nay ăn gì?",
  description: "Gợi ý món ăn theo bữa, tìm quán gần bạn.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className={`${font.className} min-h-full`}>{children}</body>
    </html>
  );
}
