import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular',
  description:
    'LuxDues hakkında merak edilenler: aidat takibi, toplu borçlandırma, çift panel sistemi, sakin portalı, güvenlik ve veri koruması hakkında sıkça sorulan sorular ve yanıtları.',
  alternates: { canonical: '/sss' },
  openGraph: {
    title: 'Sıkça Sorulan Sorular | LuxDues',
    description:
      'Aidat takibi, site yönetimi ve sakin portalı hakkında en çok sorulan soruların yanıtları.',
    url: '/sss',
  },
};

export default function SSSLayout({ children }: { children: React.ReactNode }) {
  return children;
}
