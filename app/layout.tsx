import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code Roast",
  description: "Code parsing and roast bot built with Gemini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://db.onlinewebfonts.com/c/85ae188642d05e631919cb350d543e36?family=Serifa" rel="stylesheet" type="text/css" />
        <link href="https://db.onlinewebfonts.com/c/8cb72a773a91df29733eddddaae5cf7e?family=OSerif" rel="stylesheet" type="text/css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#141423] text-[#f2e9e4]`}
      >
        {children}
      </body>
    </html>
  );
}
