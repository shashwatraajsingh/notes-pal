import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Notes Pal — A little focus. A lot of progress.",
    template: "%s | Notes Pal",
  },
  description:
    "Your free engineering study workspace. Notes, practice quizzes, flashcards, and an AI study companion. No account needed.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
