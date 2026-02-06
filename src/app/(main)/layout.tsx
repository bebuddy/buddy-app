import type { ReactNode } from "react";
import AuthGate from "@/components/AuthGate";

export const dynamic = "force-dynamic";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
