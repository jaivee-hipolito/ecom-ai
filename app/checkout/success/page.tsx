'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/ui/Loading';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (paymentIntentId && isAuthenticated) {
      // Verify payment and get order details
      const verifyPayment = async () => {
        try {
          const response = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.order && data.order._id) {
              setOrderId(data.order._id);
            }
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
        } finally {
          setIsVerifying(false);
        }
      };

      verifyPayment();
    } else {
      setIsVerifying(false);
    }
  }, [paymentIntentId, isAuthenticated, authLoading, router]);

  if (authLoading || isVerifying) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        {orderId && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="text-lg font-mono font-semibold text-gray-900">
              {orderId}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Orders
          </Link>
          <Link
            href="/dashboard/products"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

