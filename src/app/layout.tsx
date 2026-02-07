import { Noto_Sans_KR } from "next/font/google";
import "@/styles/globals.css";
import MixpanelProvider from "@/components/MixpanelProvider";
import DeepLinkHandler from "@/components/DeepLinkHandler";

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});


export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata = {
  title: "Buddy App",
  description: "중장년 친화 메인 피드",
  
  // --- PWA 설정 (유지) ---
  manifest: "/manifest.json", // <link rel="manifest" href="/manifest.json" /> 생성
  themeColor: "#4C1D95", // <meta name="theme-color" content="#4C1D95" /> 생성
  
  // iOS 홈 화면 아이콘을 명시적으로 지정
  icons: {
    apple: '/apple-touch-icon.png', 
  },
  
  // iOS PWA 설치 관련 설정
  appleWebApp: {
    capable: true,
    title: "Buddy App",
    statusBarStyle: "default", 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased font-sans">
        <MixpanelProvider>
          <DeepLinkHandler />
          <div className="mx-auto min-h-dvh flex flex-col w-full max-w-[768px] bg-white shadow-xl">
            <main className="flex-1">{children}</main>
          </div>
        </MixpanelProvider>
      </body>
    </html>
  );
}
