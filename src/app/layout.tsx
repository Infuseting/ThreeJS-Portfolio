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
  title: "SERRET Arthur - Portfolio Interactif 3D",
  description: "Portfolio interactif 3D de SERRET Arthur. Développeur web full-stack spécialisé en React, Next.js, et Three.js. Explorez mon univers en 3D.",
  keywords: ["Portfolio", "3D", "Three.js", "React", "Next.js", "Serret Arthur", "Arthur Serret", "Développeur Web", "Full-Stack", "Frontend", "Creative Developer"],
  authors: [{ name: "SERRET Arthur", url: "https://github.com/infuseting" }],
  creator: "SERRET Arthur",
  publisher: "SERRET Arthur",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://infuseting.fr/",
    title: "SERRET Arthur | Portfolio 3D Interactif",
    description: "Découvrez mon portfolio interactif en 3D. Gameplay, Windows XP, Easter Eggs, et présentation de mes compétences de développeur web.",
    siteName: "Portfolio SERRET Arthur",
    images: [{
      url: "https://infuseting.fr/og-image.png", // Fallback convention, ensure this image exists on server later
      width: 1200,
      height: 630,
      alt: "Aperçu du portfolio 3D de SERRET Arthur",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SERRET Arthur | Portfolio 3D Interactif",
    description: "Découvrez mon portfolio interactif en 3D: Gameplay, easter eggs, et expériences immersives.",
    creator: "@Infuseting",
    images: ["https://infuseting.fr/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
