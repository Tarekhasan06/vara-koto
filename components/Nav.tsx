'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Lang } from '@/lib/types';

/** Switch language on the same page, keeping the chosen stops in the address. */
export function LangSwitch({ lang }: { lang: Lang }) {
  const path = usePathname() ?? `/${lang}`;
  const qs = useSearchParams()?.toString();
  const to = (l: Lang) => path.replace(/^\/(bn|en)/, `/${l}`) + (qs ? `?${qs}` : '');
  return (
    <div className="langs" role="group" aria-label="ভাষা / Language">
      <Link href={to('bn')} aria-current={lang === 'bn' ? 'true' : undefined} hrefLang="bn" replace scroll={false}>বাংলা</Link>
      <Link href={to('en')} aria-current={lang === 'en' ? 'true' : undefined} hrefLang="en" replace scroll={false}>English</Link>
    </div>
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
