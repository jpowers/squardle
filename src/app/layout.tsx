import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Squardle",
  description: "Pick your squares and win big!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="cupcake">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <div className="navbar bg-base-100 shadow-lg px-2 sm:px-4 justify-center">
          <Link href="/" className="flex gap-0.5">
            {["S", "Q", "U", "A", "R", "D", "L", "E"].map((letter, i) => (
              <div
                key={i}
                className={`w-7 h-7 sm:w-9 sm:h-9 ${
                  ["bg-blue-600", "bg-[#69BE28]", "bg-slate-800", "bg-blue-600", "bg-[#69BE28]", "bg-slate-800", "bg-blue-600", "bg-[#69BE28]"][i]
                } rounded-md flex items-center justify-center text-white font-bold text-sm sm:text-base`}
              >
                {letter}
              </div>
            ))}
          </Link>
        </div>
        <main className="container mx-auto px-2 py-4 sm:p-4">{children}</main>
      </body>
    </html>
  );
}
