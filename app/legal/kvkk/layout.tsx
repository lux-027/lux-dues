import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description:
    '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında LuxDues tarafından işlenen kişisel veriler, işlenme amaçları, aktarım ve veri sahibi hakları hakkında aydınlatma metni.',
  alternates: { canonical: '/legal/kvkk' },
  robots: { index: true, follow: true },
};

export default function KVKKLayout({ children }: { children: React.ReactNode }) {
  return children;
}
