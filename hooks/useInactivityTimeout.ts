'use client';

import { useEffect, useRef, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UseInactivityTimeoutOptions {
  timeoutMinutes?: number; // Default: 15 minutes for regular users, 30 minutes for admin
  onTimeout?: () => void;
  enabled?: boolean;
}

export function useInactivityTimeout({
  timeoutMinutes = 15,
  onTimeout,
  enabled = true,
}: UseInactivityTimeoutOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const router = useRouter();

  const resetTimeout = useCallback(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update last activity time
    lastActivityRef.current = Date.now();

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      const handleTimeout = async () => {
        // Call custom callback if provided
        if (onTimeout) {
          onTimeout();
        }

        // Sign out the user
        try {
          await signOut({
            redirect: false,
            callbackUrl: '/login',
          });
          
          // Redirect to login with a message
          router.push('/login?timeout=true');
          router.refresh();
        } catch (error) {
          console.error('Error during timeout logout:', error);
        }
      };

      handleTimeout();
    }, timeoutMinutes * 60 * 1000); // Convert minutes to milliseconds
  }, [timeoutMinutes, onTimeout, enabled, router]);

  useEffect(() => {
    if (!enabled) return;

    // Activity events to track
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
    ];

    // Initialize timeout
    resetTimeout();

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimeout, true);
    });

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [resetTimeout, enabled]);

  // Return function to manually reset timeout (useful for API calls)
  return {
    resetTimeout,
    lastActivity: lastActivityRef.current,
  };
}
