import type { Metadata } from "next";
import "./globals.css";
import Umami from "@/components/auth/Umami";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { DeviceFingerprint } from "@/components/auth/DeviceFingerprint";
import { ViewTransitions } from "next-view-transitions";
import Footer from "@/components/core/Footer";
import { Poppins, Lexend, Montserrat, Roboto, Inter } from "next/font/google";
import { ReactLenis } from "@/utils/lenis";
import { Toaster } from "@/components/ui/sonner";
import MainNav from "@/components/core/MainNav";

import { ThemeInitScript } from "@/components/ui/ThemeInitScript";
import { GoogleAnalytics } from "@next/third-parties/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lexend",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_WEBSITE_URL || "http://stag.notesbuddy.in",
  ),
  title: {
    default: "Notes Pal - Study Smarter with AI-Powered Learning",
    template: "%s | Notes Pal",
  },
  description:
    "Transform your learning experience with Notes Pal - Access comprehensive study notes, interactive flashcards, AI-powered quizzes, and personalized study assistance. Join thousands of students achieving academic excellence.",
  keywords: [
    "study notes",
    "flashcards",
    "AI learning",
    "education",
    "student resources",
    "academic notes",
    "quiz platform",
    "study tools",
    "Notes Pal",
    "Study smarter",
    "Engineering notes",
    "B.Tech notes",
    "College resources",
    "Semester notes",
    "PYQs",
    "Flashcards",
    "Quick learning",
    "Exam preparation",
    "AI-powered study",
    "Learning resources",
    "Simplified concepts",
    "Organized notes",
    "Efficient study tools",
    "ABES EC",
    "notesera",
    "notespal notes",
    "b.tech notes",
    "b.tech first year notes",
    "b.tech second year notes",
    "b.tech third year notes",
    "b.tech fourth year notes",
    "b.tech semester notes",
    "b.tech semester 1 notes",
    "b.tech semester 2 notes",
    "b.tech semester 3 notes",
    "b.tech semester 4 notes",
    "b.tech semester 5 notes",
    "b.tech semester 6 notes",
    "b.tech semester 7 notes",
    "b.tech semester 8 notes",
  ],
  authors: [{ name: "@ramxcodes" }],
  creator: "Notes Pal",
  publisher: "Notes Pal",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "education",
  openGraph: {
    title: "Notes Pal - Study Smarter with AI-Powered Learning",
    description:
      "Transform your learning experience with Notes Pal - Access comprehensive study notes, interactive flashcards, AI-powered quizzes, and personalized study assistance. Join thousands of students achieving academic excellence.",
    url: "/",
    siteName: "Notes Pal",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Notes Pal - Study Smarter with AI-Powered Learning",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notes Pal - Study Smarter with AI-Powered Learning",
    description:
      "Transform your learning experience with Notes Pal - Access comprehensive study notes, interactive flashcards, AI-powered quizzes, and personalized study assistance.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_ENABLE_UMAMI === "true" && <Umami />}
        <ReactLenis root>
          <body
            suppressHydrationWarning
            className={`${poppins.variable} ${lexend.variable} ${montserrat.variable} ${roboto.variable} ${inter.variable}`}
          >
            <ThemeInitScript />
            <DeviceFingerprint />
            <ThemeProvider defaultTheme="light" storageKey="notes-buddy-theme">
              <MainNav />
              {children}
              <Toaster />
              <Footer />
            </ThemeProvider>
          </body>
          <GoogleAnalytics gaId="G-4NRR52WMZ2" />
        </ReactLenis>
      </html>
    </ViewTransitions>
  );
}
