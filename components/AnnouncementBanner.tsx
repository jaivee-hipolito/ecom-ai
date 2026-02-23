'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX } from 'react-icons/fi';

function shouldShowAnnouncement(path: string) {
  return !path.startsWith('/maintenance') && !path.startsWith('/admin');
}

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const refreshAnnouncement = useCallback(() => {
    const p = typeof window !== 'undefined' ? window.location.pathname : pathname ?? '';
    if (!shouldShowAnnouncement(p)) return;
    fetch('/api/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.announcementActive && data.announcement) {
          setAnnouncement(data.announcement);
        }
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    refreshAnnouncement();
  }, [refreshAnnouncement]);

  // Re-fetch when user returns to the tab (e.g. after reopening browser) so
  // the announcement shows even with persisted session / restored tab.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshAnnouncement();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [refreshAnnouncement]);

  const visible = !!announcement && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-medium">
            <FiBell className="w-4 h-4 shrink-0" aria-hidden />
            <span className="flex-1">{announcement}</span>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded hover:bg-white/20 transition-colors"
              aria-label="Dismiss announcement"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
