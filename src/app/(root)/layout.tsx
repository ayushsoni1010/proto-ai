import type { ReactNode } from "react";

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return <>{children}</>;
}
