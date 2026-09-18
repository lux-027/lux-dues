import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://www.luxdues.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LuxDues — Site, Apartman ve Aidat Takip Yönetim Sistemi",
    template: "%s | LuxDues",
  },
  description:
    "LuxDues; apartman, site ve rezidans yönetimleri için geliştirilmiş yeni nesil aidat takip, ortak gider bölüşümü, sakin yönetimi ve şikayet takip platformudur. Çoklu blok desteği, otomatik borçlandırma, PDF/Excel raporlama ve şeffaf finans yönetimi ile site yönetimini kolaylaştırır. Türkçe arayüz, mobil uyumlu ve bulut tabanlı.",
  keywords: [
    "aidat takip",
    "aidat takip programı",
    "site yönetim programı",
    "apartman yönetim yazılımı",
    "site yönetim yazılımı",
    "aidat takip sistemi",
    "apartman aidat takibi",
    "site aidat programı",
    "yönetici paneli",
    "sakin portalı",
    "ortak gider bölüşümü",
    "bina yönetimi",
    "site yöneticisi programı",
    "aidat borç takibi",
    "online aidat ödeme",
    "kat mülkiyeti yönetimi",
    "Türkçe site yönetim",
    "apartman yönetim sistemi",
    "site aidat hesaplama",
    "kat malikleri yönetimi",
    "site yönetim uygulaması",
    "aidat tahakkuk",
    "site yönetim platformu",
    "LuxDues",
    "Türkiye site yönetim",
  ],
  applicationName: "LuxDues",
  authors: [{ name: "LuxDues Inc.", url: SITE_URL }],
  creator: "LuxDues Inc.",
  publisher: "LuxDues Inc.",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "technology",
  classification: "Site ve Apartman Yönetim Yazılımı",
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },
  icons: {
    icon: [
      { url: "/logo-white.png", type: "image/png" },
      { url: "/logo-white.png", sizes: "48x48", type: "image/png" },
      { url: "/logo-white.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/logo-white.png",
    apple: [{ url: "/logo-white.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "LuxDues",
    title: "LuxDues — Site, Apartman ve Aidat Takip Yönetim Sistemi",
    description:
      "Türkiye'nin en gelişmiş site ve apartman yönetim platformu. Çoklu blok desteği, otomatik aidat borçlandırması, PDF/Excel raporlama, sakin portalı ve şeffaf finans yönetimi. Ücretsiz deneyin.",
    images: [
      {
        url: "/bannerbina.jpg",
        width: 1200,
        height: 630,
        alt: "LuxDues — Site ve Aidat Yönetim Platformu",
      },
      {
        url: "/logo-white.png",
        width: 512,
        height: 512,
        alt: "LuxDues Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LuxDues — Site, Apartman ve Aidat Takip Yönetim Sistemi",
    description:
      "Türkiye'nin en gelişmiş site ve apartman yönetim platformu. Çoklu blok desteği, otomatik aidat borçlandırması, PDF/Excel raporlama. Ücretsiz deneyin.",
    images: ["/bannerbina.jpg"],
    creator: "@lux.studio.inc",
    site: "@lux.studio.inc",
  },
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
  verification: {
    // Google Search Console doğrulama kodunuzu buraya ekleyin:
    // google: "GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },
  other: {
    "geo.region": "TR",
    "geo.placename": "Türkiye",
    "content-language": "tr",
    "article:author": "LuxDues Inc.",
    "article:publisher": "LuxDues Inc.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
