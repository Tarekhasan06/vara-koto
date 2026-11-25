import { sortedRoutes, summary } from '@/lib/data';
import { json } from '@/lib/api';

export const dynamic = 'force-static';

/** GET /api/routes → every route with its number, end points, bus names, length and number of stops */
export function GET() {
  return json(sortedRoutes().map(summary));
}
