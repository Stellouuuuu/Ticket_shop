"use client";

import IntroSplash from "./IntroSplash";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IntroSplash />
      {children}
    </>
  );
}
