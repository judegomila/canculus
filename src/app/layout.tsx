import type { Metadata } from "next";
import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT", "WONK"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-body",
  style: ["normal", "italic"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "A Calculus for Adaptive Pathways — an interactive walkthrough",
  description:
    "An interactive exposition of 'A Compositional Calculus for Adaptive Biological Pathways' (Gomila, 2026): routes, De Morgan intervention duality, adaptation closure, and robust cuts — with live simulations.",
  openGraph: {
    title: "A Calculus for Adaptive Pathways",
    description:
      "Why cutting a cancer pathway can create the escape route you didn't block — an interactive walkthrough with live simulations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${newsreader.variable} ${plexMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
