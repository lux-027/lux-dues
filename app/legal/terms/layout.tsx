import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanıcı ve Hizmet Sözleşmesi',
  description:
    'LuxDues platformu kullanım koşulları, hizmet kapsamı, hesap güvenliği, finansal işlemler ve fikri mülkiyet hakları hakkında kullanıcı ve hizmet sözleşmesi.',
  alternates: { canonical: '/legal/terms' },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
