'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const ALLOWED_PREFIXES = ['/maintenance', '/api', '/admin', '/login', '/register'];
const ALLOWED_EXACT = ['/maintenance', '/login', '/register'];

function fetchMaintenanceMode(): Promise<boolean> {
  return fetch('/api/site-settings')
    .then((res) => res.json())
    .then((data) => !!data.maintenanceMode)
    .catch(() => false);
}

export default function MaintenanceGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);

  const refreshMaintenance = useCallback(() => {
    const p = typeof window !== 'undefined' ? window.location.pathname : pathname ?? '';
    if (p.startsWith('/api') || p.startsWith('/_next')) return;
    fetchMaintenanceMode().then(setMaintenanceMode);
  }, [pathname]);

  useEffect(() => {
    refreshMaintenance();
  }, [refreshMaintenance]);

  // Re-fetch when user returns to the tab (e.g. after reopening browser) so
  // maintenance state is always fresh and redirect applies even with persisted session.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshMaintenance();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refreshMaintenance]);

  useEffect(() => {
    if (authLoading || maintenanceMode === null) return;
    if (!maintenanceMode || isAdmin) return;

    const allowed =
      ALLOWED_EXACT.includes(pathname || '') ||
      ALLOWED_PREFIXES.some((p) => pathname?.startsWith(p));
    if (!allowed) {
      router.replace('/maintenance');
    }
  }, [authLoading, maintenanceMode, isAdmin, pathname, router]);

  return null;
}
