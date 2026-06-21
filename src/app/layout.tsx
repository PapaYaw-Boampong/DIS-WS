import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { HOME_INTRO_STORAGE_KEY } from "@/lib/homeIntro";
import { siteConfig } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const homeIntroBootstrapScript = `
  (() => {
    if (window.location.pathname !== "/") {
      return;
    }

    try {
      document.documentElement.dataset.disHomeIntro =
        window.sessionStorage.getItem("${HOME_INTRO_STORAGE_KEY}") === "1"
          ? "seen"
          : "pending";
    } catch {
      document.documentElement.dataset.disHomeIntro = "pending";
    }
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/images/brand/dis-logo.png",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
    images: [
      {
        url: siteConfig.socialImage,
        width: 512,
        height: 512,
        alt: `${siteConfig.name} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.socialImage],
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: homeIntroBootstrapScript }}
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
