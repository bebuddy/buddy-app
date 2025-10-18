import { Noto_Sans_KR } from "next/font/google";
import "@/styles/globals.css";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata = {
  title: "Buddy App",
  description: "중장년 친화 메인 피드",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSans.className}>
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased">
        <div className="mx-auto min-h-dvh flex flex-col w-full max-w-[768px] bg-white">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
