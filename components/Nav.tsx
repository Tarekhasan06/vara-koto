'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Lang } from '@/lib/types';

/** One link to the same page in the other language, keeping the chosen stops in the address. */
export function LangSwitch({ lang }: { lang: Lang }) {
  const path = usePathname() ?? `/${lang}`;
  const qs = useSearchParams()?.toString();
  const other: Lang = lang === 'bn' ? 'en' : 'bn';
  const href = path.replace(/^\/(bn|en)/, `/${other}`) + (qs ? `?${qs}` : '');
  return (
    <Link className="lang" href={href} hrefLang={other} lang={other} replace scroll={false}>
      {other === 'en' ? 'English' : 'বাংলা'}
    </Link>
  );
}

export function NavTabs({ lang, search, routes }: { lang: Lang; search: string; routes: string }) {
  const path = usePathname() ?? '';
  const onRoutes = path.startsWith(`/${lang}/routes`);
  return (
    <nav className="tabs" aria-label={lang === 'en' ? 'Pages' : 'পাতা'}>
      <Link href={`/${lang}`} aria-current={onRoutes ? undefined : 'page'}>{search}</Link>
      <Link href={`/${lang}/routes`} aria-current={onRoutes ? 'page' : undefined}>{routes}</Link>
    </nav>
  );
}
