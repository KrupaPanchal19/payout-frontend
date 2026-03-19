import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SWRProvider } from "@/lib/swr/SWRProvider";

export const metadata: Metadata = {
  title: "CORD4 - Payout Ops",
  description: "Vendor & payout request workflow demo"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SWRProvider>
          <AppShell>{children}</AppShell>
        </SWRProvider>
      </body>
    </html>
  );
}

