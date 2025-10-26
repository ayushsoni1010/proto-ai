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
  title: {
    default: "Proto AI - Modern Task Management",
    template: "%s | Proto AI",
  },
  description:
    "A modern, intuitive task management application built with Next.js. Organize your projects with drag-and-drop boards, track progress, and boost productivity.",
  keywords: [
    "kanban board",
    "task management",
    "project management",
    "productivity",
    "todo list",
    "agile",
    "scrum",
    "task tracker",
    "project planner",
    "Next.js",
  ],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  publisher: "Your Name",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Proto AI - Modern Task Management",
    description:
      "A modern, intuitive task management application built with Next.js. Organize your projects with drag-and-drop boards, track progress, and boost productivity.",
    siteName: "Proto AI",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Proto AI - Task Management Application",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Proto AI - Modern Task Management",
    description:
      "A modern, intuitive task management application built with Next.js. Organize your projects with drag-and-drop boards, track progress, and boost productivity.",
    images: ["/og-image.svg"],
    creator: "@yourusername",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.svg",
  },
  manifest: "/manifest.json",
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
