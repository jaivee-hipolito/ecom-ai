'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiClock } from 'react-icons/fi';

export default function SessionSecurity() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = !!session?.user;
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Determine timeout based on user role
  // Admin: 30 minutes, Regular users: 15 minutes
  const timeoutMinutes = session?.user && (session.user as any).role === 'admin' ? 30 : 15;
  const warningMinutes = 2; // Show warning 2 minutes before timeout

  // Handle inactivity timeout
  const handleTimeout = () => {
    console.log('Session timeout due to inactivity');
  };

  // Track time remaining for warning
  useEffect(() => {
    if (!isAuthenticated || status !== 'authenticated') return;

    const interval = setInterval(() => {
      // This is approximate - the hook handles the actual timeout
      // We'll show warning based on a timer
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, status]);

  // Use inactivity timeout hook
  const { resetTimeout, lastActivity } = useInactivityTimeout({
    timeoutMinutes,
    onTimeout: handleTimeout,
    enabled: isAuthenticated && status === 'authenticated',
  });

  // Show warning before timeout
  useEffect(() => {
    if (!isAuthenticated || status !== 'authenticated') {
      setShowWarning(false);
      return;
    }

    const checkWarning = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;
      const timeUntilTimeout = timeoutMinutes * 60 * 1000 - timeSinceActivity;
      const warningTime = warningMinutes * 60 * 1000;

      if (timeUntilTimeout > 0 && timeUntilTimeout <= warningTime) {
        setShowWarning(true);
        setTimeRemaining(Math.ceil(timeUntilTimeout / 1000 / 60)); // minutes
      } else {
        setShowWarning(false);
      }
    };

    const interval = setInterval(checkWarning, 10000); // Check every 10 seconds
    checkWarning(); // Initial check

    return () => clearInterval(interval);
  }, [isAuthenticated, status, lastActivity, timeoutMinutes, warningMinutes]);

  // Browser close detection is now handled by BrowserCloseDetector component

  // Handle extended tab inactivity (tab hidden for too long)
  useEffect(() => {
    if (!isAuthenticated || status !== 'authenticated') return;

    let hiddenTime: number | null = null;
    const TAB_HIDDEN_TIMEOUT = 10 * 60 * 1000; // 10 minutes

    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenTime = Date.now();
      } else {
        if (hiddenTime && Date.now() - hiddenTime > TAB_HIDDEN_TIMEOUT) {
          // Tab was hidden for more than 10 minutes, sign out
          signOut({ redirect: false }).then(() => {
            router.push('/login?timeout=true');
            router.refresh();
          });
        }
        hiddenTime = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, status, router]);

  const handleStayLoggedIn = () => {
    resetTimeout();
    setShowWarning(false);
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] shadow-lg"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiClock className="w-5 h-5" />
              <span className="font-semibold">
                Your session will expire in {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''} due to inactivity.
              </span>
            </div>
            <button
              onClick={handleStayLoggedIn}
              className="px-4 py-2 bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 rounded-lg hover:bg-[#FC9BC2] transition-colors font-medium"
            >
              Stay Logged In
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
