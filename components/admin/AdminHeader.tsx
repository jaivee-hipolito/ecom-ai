'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';

export default function AdminHeader() {
  const { user } = useAuth();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Panel
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.firstName && user?.lastName
                  ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                  : user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'Admin'}
                </span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

