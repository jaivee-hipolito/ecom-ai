'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Component to detect browser close and handle logout
 * This runs on all pages to ensure browser close is detected
 */
export default function BrowserCloseDetector() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = !!session?.user;
  const hasCheckedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only runs on client side to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check on page load if browser was closed
  useEffect(() => {
    // Only run on client side
    if (!isMounted) return;
    
    // Prevent multiple checks
    if (hasCheckedRef.current) return;
    
    const SESSION_ACTIVE_KEY = 'session_active'; // sessionStorage - cleared when browser closes
    
    // Safely access sessionStorage (only on client)
    if (typeof window === 'undefined') return;
    
    // If we're on login page with closed=true, don't do anything (already handled)
    const closedParam = searchParams?.get('closed');
    if (pathname === '/login' && closedParam === 'true') {
      hasCheckedRef.current = true;
      return;
    }

    // Wait for session status to be determined
    if (status === 'loading') {
      return;
    }

    // Check if browser was closed
    // sessionStorage is cleared when browser closes, so if user is authenticated
    // but sessionStorage flag doesn't exist, browser was closed
    // EXCEPTION: If window.opener exists, we're in a tab opened via target="_blank"
    // (e.g. Terms link) - new tabs have empty sessionStorage but user didn't close browser
    let wasSessionActive: string | null = null;
    try {
      wasSessionActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);
    } catch (e) {
      // sessionStorage might not be available (private browsing, etc.)
      console.warn('sessionStorage not available:', e);
      hasCheckedRef.current = true;
      return;
    }

    const isNewTabFromLink = typeof window !== 'undefined' && !!window.opener;
    
    // If user is authenticated but sessionStorage flag doesn't exist, browser was closed
    // Skip logout when we're in a newly opened tab (e.g. Terms/Privacy opened via target="_blank")
    if (isAuthenticated && status === 'authenticated' && !wasSessionActive && !isNewTabFromLink) {
      console.log('Browser was closed - signing out and redirecting');
      // Browser was closed - sign out and redirect
      hasCheckedRef.current = true;
      signOut({ redirect: false }).then(() => {
        console.log('Redirecting to login with closed=true');
        router.push('/login?closed=true');
        router.refresh();
      });
      return;
    }
    
    // Set flag to indicate session is active (in sessionStorage - cleared on browser close)
    if (isAuthenticated && status === 'authenticated') {
      try {
        sessionStorage.setItem(SESSION_ACTIVE_KEY, 'true');
      } catch (e) {
        console.warn('Failed to set sessionStorage:', e);
      }
      hasCheckedRef.current = true;
    } else {
      // Clear flag when not authenticated
      try {
        sessionStorage.removeItem(SESSION_ACTIVE_KEY);
      } catch (e) {
        console.warn('Failed to remove sessionStorage:', e);
      }
      hasCheckedRef.current = true;
    }
  }, [isAuthenticated, status, pathname, searchParams, router, session, isMounted]);

  // Update sessionStorage flag periodically while authenticated
  // sessionStorage is automatically cleared when browser closes, so we just need to keep it updated
  useEffect(() => {
    if (!isMounted || !isAuthenticated || status !== 'authenticated') {
      return;
    }

    // Only run on client side
    if (typeof window === 'undefined') return;

    const HEARTBEAT_INTERVAL = 2000; // 2 seconds - keep sessionStorage flag updated
    const heartbeatInterval = setInterval(() => {
      try {
        sessionStorage.setItem('session_active', 'true');
      } catch (e) {
        console.warn('Failed to update sessionStorage heartbeat:', e);
        clearInterval(heartbeatInterval);
      }
    }, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [isAuthenticated, status, isMounted]);

  return null;
}
