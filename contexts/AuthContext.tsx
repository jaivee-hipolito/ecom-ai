'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { AuthUser } from '@/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        _id: (session.user as any).id,
        firstName: (session.user as any).firstName || '',
        lastName: (session.user as any).lastName || '',
        contactNumber: (session.user as any).contactNumber || '',
        email: session.user.email || '',
        role: (session.user as any).role || 'customer',
        image: session.user.image || '',
      }
    : null;

  const isLoading = status === 'loading';
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
