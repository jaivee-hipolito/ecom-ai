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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 min-h-[3.5rem]">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
              Admin Panel
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-3">
            <div className="hidden sm:flex items-center space-x-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#F9629F] to-[#DB7093] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.firstName && user?.lastName
                  ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
                  : user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'Admin'}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[120px] md:max-w-none">{user?.email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

