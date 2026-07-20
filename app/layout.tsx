import type { Metadata } from "next";
import { Lato, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-lato",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "CSM YouTube Family Dashboard",
  description: "Common Sense Media YouTube Family Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} ${sourceSerif.variable}`}>
      <body style={{ margin: 0, padding: 0, height: '100%' }}>{children}</body>
    </html>
  );
}
