import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@rap/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "React Admin Pro - Next.js App",
  description:
    "A high-performance React admin dashboard featuring Next.js, TanStack Query, ShadCN, Tailwind CSS v4, and more. Optimized for speed and scalability.",
  keywords:
    "React, Next.js, TanStack Query, ShadCN, Tailwind CSS, Admin Dashboard, SSR, TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
