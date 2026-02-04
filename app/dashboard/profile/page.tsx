'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { useRouter } from 'next/navigation';

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  role: string;
  image?: string;
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="Loading profile..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-medium text-gray-900">
                {userProfile?.firstName && userProfile?.lastName
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Contact Number</p>
              <p className="text-lg font-medium text-gray-900">{userProfile?.contactNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium text-gray-900">{userProfile?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-medium text-gray-900 capitalize">{userProfile?.role || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Addresses Card */}
        <Link href="/dashboard/profile/addresses" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Shipping Addresses</h2>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <p className="text-gray-600">Manage your shipping addresses</p>
          <Button variant="outline" className="mt-4 w-full">
            Manage Addresses
          </Button>
        </Link>

        {/* Orders Card */}
        <Link href="/dashboard/orders" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <p className="text-gray-600">View your order history</p>
          <Button variant="outline" className="mt-4 w-full">
            View Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}

