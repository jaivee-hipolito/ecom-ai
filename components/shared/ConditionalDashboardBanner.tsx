'use client';

import { usePathname } from 'next/navigation';
import PageTopBanner from './PageTopBanner';

const HIDE_BANNER_PATHS = ['/dashboard/orders', '/dashboard/profile'];

export default function ConditionalDashboardBanner() {
  const pathname = usePathname();
  const hide = pathname && HIDE_BANNER_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (hide) return null;
  return <PageTopBanner />;
}
