import 'server-only';
import { NextResponse } from 'next/server';

/** Fare data only changes when the charts change, so let the CDN keep answers for a day. */
export const CACHE = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';

export const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: status === 200 ? { 'Cache-Control': CACHE } : {} });

export const bad = (error: string) => json({ error }, 400);

export function stopParam(v: string | null, count: number): number | null {
  if (v === null || !/^\d+$/.test(v)) return null;
  const n = Number(v);
  return n < count ? n : null;
}
