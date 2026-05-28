import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Predict402",
  description: "Prediction markets with x402-paid research and MCP execution.",
  other: {
    "talentapp:project_verification":
      "25417ef6183d26ea0234d310468b1e65bce31bff584ca4c44afb24801704ad927a71b77208a37ee80b366068dca884e57b072e910803df3773a7baaab9038101",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
