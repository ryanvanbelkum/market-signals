import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
