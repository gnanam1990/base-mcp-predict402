import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Predict402",
  description: "Prediction markets with x402-paid research and MCP execution.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
