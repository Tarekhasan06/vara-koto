import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import '@fontsource-variable/anek-bangla';
import '@fontsource/baloo-da-2/600.css';
import '@fontsource/baloo-da-2/800.css';
import '../globals.css';
import { dict } from '@/lib/i18n';
import { isLang, LANGS } from '@/lib/types';
import { LangSwitch, NavTabs } from '@/components/Nav';

export const dynamicParams = false;
export const generateStaticParams = () => LANGS.map((lang) => ({ lang }));

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict[isLang(lang) ? lang : 'bn'];
  return {
    title: { default: `${t.siteName} ${t.tagline}`, template: `%s | ${t.siteName}` },
    description: t.metaDescription,
    alternates: { languages: { bn: '/bn', en: '/en' } },
    openGraph: { title: t.siteName, description: t.metaDescription, type: 'website' },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#006a4e' },
    { media: '(prefers-color-scheme: dark)', color: '#0a5a43' },
  ],
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dict[lang];
  return (
    <html lang={lang}>
      <body>
        <div className="wrap">
          <header className="mast">
            <a className="brand" href={`/${lang}`}>
              <b>ভাড়া কত<i>?</i></b>
              <span>{t.tagline}</span>
            </a>
            <div className="nav">
              <Suspense fallback={<span className="langs" />}>
                <LangSwitch lang={lang} />
              </Suspense>
              <NavTabs lang={lang} search={t.tabSearch} routes={t.tabRoutes} />
            </div>
          </header>
          <main>{children}</main>
          <footer className="foot">
            <p>{t.footSource}</p>
            <p><strong>{t.footMin}</strong></p>
            <p>{t.footNote}</p>
            <p>
              <a href="/api/routes">API</a>
              {' '}
              <a href="https://github.com/Tarekhasan06/vara-koto">GitHub</a>
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
