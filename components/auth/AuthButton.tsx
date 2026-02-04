'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="animate-pulse bg-gray-200 h-10 w-20 rounded"></div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          {(session.user as any)?.firstName && (session.user as any)?.lastName
            ? `${(session.user as any).firstName} ${(session.user as any).lastName}`
            : session.user?.name || session.user?.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            signOut({ callbackUrl: '/' });
          }}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push('/login')}
      >
        Sign In
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => router.push('/register')}
      >
        Sign Up
      </Button>
    </div>
  );
}
