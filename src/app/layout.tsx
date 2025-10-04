import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Buddy App",
  description: "중장년 친화 메인 피드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased">
        <div className="mx-auto min-h-dvh flex flex-col w-full max-w-[440px] bg-white">
          <main className="flex-1">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
