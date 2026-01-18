"use client";

import type { ReactNode } from "react";
import { IonApp } from "@ionic/react";

export default function IonicProvider({ children }: { children: ReactNode }) {
  return <IonApp>{children}</IonApp>;
}
