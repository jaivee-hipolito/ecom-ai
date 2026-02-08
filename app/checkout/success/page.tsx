'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import Loading from '@/components/ui/Loading';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { refreshCart } = useCart();
  const [isVerifying, setIsVerifying] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  // Handle both payment_intent (from our redirect) and payment_intent_client_secret (from Stripe redirect)
  const paymentIntentId = searchParams.get('payment_intent') || 
    (searchParams.get('payment_intent_client_secret')?.split('_secret_')[0] || null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (paymentIntentId && isAuthenticated) {
      // Verify payment and get order details
      const verifyPayment = async () => {
        try {
          // First, verify the payment intent
          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId,
            }),
          });

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            setPaymentStatus(verifyData.paymentStatus);
            
            // Check if payment actually succeeded
            if (verifyData.paymentStatus !== 'succeeded') {
              // Payment failed or was canceled
              setPaymentError(
                verifyData.paymentStatus === 'canceled' 
                  ? 'Your payment was canceled. Please try again.'
                  : verifyData.paymentStatus === 'requires_payment_method'
                  ? 'Your payment method was declined. Please try a different payment method.'
                  : 'Your payment failed. Please try again.'
              );
              setIsVerifying(false);
              return;
            }
            
            // Payment succeeded - proceed with order handling
            // If order exists, use it
            if (verifyData.order && verifyData.order._id) {
              setOrderId(verifyData.order._id);
              // Refresh cart to reflect removed items
              await refreshCart();
            } else if (verifyData.success && verifyData.paymentStatus === 'succeeded') {
              // Payment succeeded but no order found - create order as fallback
              // This handles cases where webhook hasn't fired yet (local development) or failed
              console.warn('Payment succeeded but no order found. Creating order as fallback...');
              
              try {
                // Retrieve payment intent to get metadata
                const stripeResponse = await fetch('/api/payments/get-intent', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    paymentIntentId,
                  }),
                });

                if (stripeResponse.ok) {
                  const intentData = await stripeResponse.json();
                  const metadata = intentData.metadata || {};
                  
                  if (metadata.userId && metadata.shippingAddress) {
                    // Create order from payment intent metadata
                    const createOrderResponse = await fetch('/api/orders/create-from-intent', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        paymentIntentId,
                      }),
                    });

                    if (createOrderResponse.ok) {
                      const orderData = await createOrderResponse.json();
                      setOrderId(orderData._id);
                      await refreshCart();
                      console.log('Order created successfully from success page:', orderData._id);
                    } else {
                      console.error('Failed to create order:', await createOrderResponse.text());
                    }
                  } else {
                    console.error('Missing metadata in payment intent:', { userId: metadata.userId, hasShippingAddress: !!metadata.shippingAddress });
                  }
                } else {
                  console.error('Failed to retrieve payment intent:', await stripeResponse.text());
                }
              } catch (createError) {
                console.error('Error creating order from success page:', createError);
              }
              
              // Refresh cart anyway
              await refreshCart();
            }
          } else {
            // Verification API call failed
            const errorText = await verifyResponse.text();
            console.error('Payment verification failed:', errorText);
            setPaymentError('Unable to verify payment status. Please check your orders or contact support.');
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          setPaymentError('Unable to verify payment status. Please check your orders or contact support.');
        } finally {
          setIsVerifying(false);
        }
      };

      verifyPayment();
    } else if (!paymentIntentId) {
      // No payment intent ID - redirect to cart
      router.push('/dashboard/cart');
    } else {
      setIsVerifying(false);
    }
  }, [paymentIntentId, isAuthenticated, authLoading, router]);

  // Always show loading until verification is complete
  if (authLoading || isVerifying) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  // Show error if payment failed (only after verification is complete)
  // Only show error if we have verified the payment status and it's not succeeded
  if (paymentError || (paymentStatus !== null && paymentStatus !== 'succeeded')) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            {paymentError || 'Your payment could not be processed. Please try again.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/checkout"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </Link>
            <Link
              href="/dashboard/cart"
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Only show success if payment status is explicitly 'succeeded'
  // If paymentStatus is null but no error, still show loading (shouldn't happen, but safety check)
  if (paymentStatus === null && !paymentError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  // Only show success if payment actually succeeded
  if (paymentStatus === 'succeeded' && !paymentError) {
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
  
  // Fallback: if we reach here, something went wrong - show error
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Failed
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          {paymentError || 'Your payment could not be processed. Please try again.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/checkout"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard/cart"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

