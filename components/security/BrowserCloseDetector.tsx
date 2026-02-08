'use client';

import { useEffect, useRef, Suspense } from 'react';
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

  // Check on page load if browser was closed
  useEffect(() => {
    // Prevent multiple checks
    if (hasCheckedRef.current) return;
    
    const SESSION_ACTIVE_KEY = 'session_active'; // sessionStorage - cleared when browser closes
    
    // If we're on login page with closed=true, don't do anything (already handled)
    if (pathname === '/login' && searchParams?.get('closed') === 'true') {
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
    const wasSessionActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);
    
    console.log('BrowserCloseDetector - Check:', {
      isAuthenticated,
      status,
      wasSessionActive,
      pathname,
      hasSession: !!session
    });
    
    // If user is authenticated but sessionStorage flag doesn't exist, browser was closed
    if (isAuthenticated && status === 'authenticated' && !wasSessionActive) {
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
      sessionStorage.setItem(SESSION_ACTIVE_KEY, 'true');
      hasCheckedRef.current = true;
    } else {
      // Clear flag when not authenticated
      sessionStorage.removeItem(SESSION_ACTIVE_KEY);
      hasCheckedRef.current = true;
    }
  }, [isAuthenticated, status, pathname, searchParams, router, session]);

  // Update sessionStorage flag periodically while authenticated
  // sessionStorage is automatically cleared when browser closes, so we just need to keep it updated
  useEffect(() => {
    if (!isAuthenticated || status !== 'authenticated') {
      return;
    }

    const HEARTBEAT_INTERVAL = 2000; // 2 seconds - keep sessionStorage flag updated
    const heartbeatInterval = setInterval(() => {
      sessionStorage.setItem('session_active', 'true');
    }, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [isAuthenticated, status]);

  return null;
}
