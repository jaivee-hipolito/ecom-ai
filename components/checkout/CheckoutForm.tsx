'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '@/config/stripe';
import AddressForm from './AddressForm';
import AddressSelector from './AddressSelector';
import OrderSummary from './OrderSummary';
import PaymentForm from './PaymentForm';
import { ShippingAddress } from '@/types/address';
import { useCart } from '@/contexts/CartContext';
import Loading from '@/components/ui/Loading';
import Footer from '@/components/shared/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiCreditCard, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { calculateBCTaxAmount } from '@/utils/tax';

// Only load Stripe if publishable key is available
const stripePromise = STRIPE_CONFIG.publishableKey
  ? loadStripe(STRIPE_CONFIG.publishableKey)
  : null;

type CheckoutStep = 'address' | 'payment';

export default function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, getCartSummary, isLoading: cartLoading } = useCart();
  const [step, setStep] = useState<CheckoutStep>('address');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  const cartSummary = cart ? getCartSummary() : { totalItems: 0, totalPrice: 0, items: [] };

  const handleCouponApplied = async (discount: number) => {
    setCouponDiscount(discount);
    
    // If payment intent already exists, we need to recreate it with new amount
    if (clientSecret && shippingAddress) {
      try {
        const shipping = 0;
        const tax = calculateBCTaxAmount(cartSummary.totalPrice - discount);
        const finalAmount = Math.max(0, cartSummary.totalPrice - discount + shipping + tax);

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: finalAmount,
            currency: 'usd',
          }),
        });

        if (response.ok) {
          const { clientSecret: newSecret } = await response.json();
          setClientSecret(newSecret);
        }
      } catch (err) {
        console.error('Failed to update payment intent:', err);
      }
    }
  };

  const handleAddressSubmit = async (address: ShippingAddress) => {
    setShippingAddress(address);
    setIsProcessing(true);
    setError(null);

    try {
      // Calculate final amount with discount
      const shipping = 0;
      const tax = calculateBCTaxAmount(cartSummary.totalPrice - couponDiscount);
      const finalAmount = Math.max(0, cartSummary.totalPrice - couponDiscount + shipping + tax);

      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create payment intent');
        } else {
          // Response is not JSON (likely HTML error page)
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const { clientSecret: secret } = await response.json();
      setClientSecret(secret);
      setStep('payment');
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if address is provided via URL params (from cart page)
  useEffect(() => {
    const addressFromParams = searchParams.get('fullName');
    if (addressFromParams && !shippingAddress && step === 'address') {
      const address: ShippingAddress = {
        fullName: searchParams.get('fullName') || '',
        address: searchParams.get('address') || '',
        city: searchParams.get('city') || '',
        state: searchParams.get('state') || '',
        zipCode: searchParams.get('zipCode') || '',
        country: searchParams.get('country') || '',
        phone: searchParams.get('phone') || '',
      };
      // Skip address step and go directly to payment
      handleAddressSubmit(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.push('/dashboard/cart');
      return;
    }
  }, [cart, router]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!shippingAddress) {
      setError('Shipping address is required');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress,
          paymentMethod: 'card',
          paymentIntentId,
        }),
      });

      if (!orderResponse.ok) {
        const data = await orderResponse.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Verify payment (optional - webhook will handle it, but we can verify here too)
      try {
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId,
            orderId: orderData._id,
          }),
        });
      } catch (verifyError) {
        // Log but don't fail - webhook will handle it
        console.warn('Payment verification failed, but order created:', verifyError);
      }

      // Redirect to success page
      router.push(`/checkout/success?payment_intent=${paymentIntentId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to complete order');
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex justify-center items-center">
        <Loading size="lg" text="Loading checkout..." />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const shipping = 0; // Free shipping for now
  const tax = calculateBCTaxAmount(cartSummary.totalPrice - couponDiscount); // BC tax: 5% GST + 7% PST = 12% total
  const total = Math.max(0, cartSummary.totalPrice - couponDiscount + shipping + tax);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-3 rounded-xl shadow-lg">
              <FiCreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#050b2c]">
                Checkout
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Complete your order securely
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {/* Step 1: Address */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-sm sm:text-base transition-all ${
                step === 'address' 
                  ? 'bg-gradient-to-br from-[#ffa509] to-[#ff8c00] text-white shadow-lg scale-110' 
                  : step === 'payment'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step === 'payment' ? <FiCheck className="w-6 h-6" /> : '1'}
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-semibold ${step === 'address' ? 'text-[#050b2c]' : 'text-gray-500'}`}>
                  Shipping Address
                </p>
              </div>
            </div>

            {/* Connector Line */}
            <div className={`h-1 w-12 sm:w-24 rounded-full transition-all ${
              step === 'payment' ? 'bg-gradient-to-r from-[#ffa509] to-[#ff8c00]' : 'bg-gray-200'
            }`} />

            {/* Step 2: Payment */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-sm sm:text-base transition-all ${
                step === 'payment' 
                  ? 'bg-gradient-to-br from-[#ffa509] to-[#ff8c00] text-white shadow-lg scale-110' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-semibold ${step === 'payment' ? 'text-[#050b2c]' : 'text-gray-500'}`}>
                  Payment
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800 shadow-lg"
            >
              <p className="font-semibold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {step === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-2 rounded-lg">
                      <FiMapPin className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#050b2c]">
                      Shipping Address
                    </h2>
                  </div>
                  <AddressSelector
                    onSelect={handleAddressSubmit}
                    isLoading={isProcessing}
                  />
                </motion.div>
              )}

              {step === 'payment' && clientSecret && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Shipping Address Display */}
                  {shippingAddress && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-[#050b2c] to-[#0a1538] rounded-2xl shadow-xl p-6 border border-white/10"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-2 rounded-lg">
                          <FiMapPin className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Shipping to:</h3>
                      </div>
                      <div className="text-white/90 space-y-1 text-sm sm:text-base">
                        <p className="font-semibold">{shippingAddress.fullName}</p>
                        <p>{shippingAddress.address}</p>
                        <p>
                          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                        </p>
                        <p>{shippingAddress.country}</p>
                        <p className="text-white/70">Phone: {shippingAddress.phone}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Payment Form */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-2 rounded-lg">
                        <FiCreditCard className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-[#050b2c]">
                        Payment Information
                      </h2>
                    </div>
                    {!stripePromise ? (
                      <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-yellow-800">
                        <p>Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.</p>
                      </div>
                    ) : (
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: 'stripe',
                            variables: {
                              colorPrimary: '#ffa509',
                              colorBackground: '#ffffff',
                              colorText: '#050b2c',
                              colorDanger: '#ef4444',
                              fontFamily: 'system-ui, sans-serif',
                              borderRadius: '0.75rem',
                            },
                          },
                        }}
                      >
                        <PaymentForm
                          clientSecret={clientSecret}
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                          isLoading={isProcessing}
                        />
                      </Elements>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <OrderSummary
              items={cart.items || []}
              subtotal={cartSummary.totalPrice}
              shipping={shipping}
              tax={tax}
              total={total}
              onCouponApplied={handleCouponApplied}
            />
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
