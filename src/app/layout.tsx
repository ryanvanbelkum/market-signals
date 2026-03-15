import type { Metadata } from "next";
import "./globals.css";
import { MarketSignalsSidebar } from "@/components/market-signals-shell";

export const metadata: Metadata = {
  title: "Market Signals",
  description: "A local-market terminal for B2B sales triggers in Kansas City and St. Joseph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />
          <MarketSignalsSidebar />
          {children}
        </div>
      </body>
    </html>
  );
}
