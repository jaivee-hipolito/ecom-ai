'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import Loading from '@/components/ui/Loading';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin?redirect=/checkout');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <CheckoutForm />;
}
