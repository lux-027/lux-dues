const SITE_URL = 'https://www.luxdues.com';

// JSON-LD structured data for search engines and AI assistants.
// FAQPage schema is especially important: it lets Google and AI tools
// (ChatGPT, Gemini, Perplexity etc.) cite LuxDues answers directly.
export function StructuredData() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'LuxDues',
    legalName: 'LuxDues Inc.',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo-white.png`,
      width: 512,
      height: 512,
    },
    description:
      'Apartman ve site yönetimleri için aidat takip, ortak gider bölüşümü ve sakin portalı sunan yeni nesil yönetim platformu.',
    email: 'lux.studio.tr@gmail.com',
    sameAs: ['https://www.instagram.com/lux.studio.inc/'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'lux.studio.tr@gmail.com',
      availableLanguage: ['Turkish'],
    },
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'LuxDues',
    description:
      'Site ve apartman yönetimi için aidat takip ve finans yönetim platformu.',
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'tr-TR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/sss?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    name: 'LuxDues',
    url: SITE_URL,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Property Management Software',
    operatingSystem: 'Web',
    inLanguage: 'tr-TR',
    description:
      'LuxDues; apartman, site ve rezidans yönetimleri için aidat takibi, toplu borçlandırma, ortak gider bölüşümü, sakin portalı ve şikayet takibi sunan bulut tabanlı yönetim yazılımıdır.',
    featureList: [
      'Aidat takibi ve toplu borçlandırma',
      'Çoklu blok ve bina yönetimi',
      'Ortak masraf otomatik bölüşümü',
      'Sakin portalı ve borç görüntüleme',
      'Şikayet ve talep takibi',
      'Yönetici yetkilendirme sistemi',
      'Bildirim sistemi',
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY',
      description: 'Demo hesap ile ücretsiz deneme',
    },
    provider: { '@id': `${SITE_URL}/#organization` },
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/sss#faq`,
    mainEntity: [
      {
        '@type': 'Question',
        name: 'LuxDues nedir ve kimler kullanabilir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LuxDues, apartman ve site yönetimleri için geliştirilmiş modern, bulut tabanlı bir aidat ve mülk yönetim platformudur. Hem profesyonel site yöneticileri hem de daire sakinleri kendi panelleri üzerinden şeffaf şekilde borç, makbuz, duyuru ve talepleri takip edebilir.',
        },
      },
      {
        '@type': 'Question',
        name: 'Aynı e-posta adresi ile hem Yönetici hem de Sakin paneli kullanılabilir mi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Evet. LuxDues çift panel mimarisi sunar. Aynı e-posta adresiyle hem bir veya birden fazla binanın yöneticisi olabilir hem de oturduğunuz dairenin sakini olarak aidatlarınızı takip edebilirsiniz.',
        },
      },
      {
        '@type': 'Question',
        name: 'Toplu aidat tahakkuku nasıl yapılır?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yönetici panelinde ilgili binaya girdikten sonra "Aidat Takibi" bölümünden "Toplu Aidat Ekle" butonuna tıklayarak ay, yıl, tutar ve son ödeme tarihini seçmeniz yeterlidir. Sistem tüm blok ve dairelere otomatik olarak aidat borçlandırması yapar.',
        },
      },
      {
        '@type': 'Question',
        name: 'Verilerimiz ve finansal kayıtlarımız nasıl korunuyor?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LuxDues, 256-bit SSL/TLS şifreleme protokolleri ve güvenli bulut veritabanı altyapısı kullanır. Parolalarınız tek yönlü hash algoritmalarıyla korunur ve 6698 sayılı KVKK standartlarına tam uyum sağlanır.',
        },
      },
      {
        '@type': 'Question',
        name: 'Mobil cihazlardan LuxDues kullanılabilir mi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Evet. LuxDues %100 mobil uyumlu (responsive) bir arayüze sahiptir. Telefon veya tablet tarayıcınızdan giriş yaparak tüm işlemleri gerçekleştirebilirsiniz.',
        },
      },
    ],
  };

  const graph = [organization, website, software, faq];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
