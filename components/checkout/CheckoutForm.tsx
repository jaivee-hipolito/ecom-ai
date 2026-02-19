'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/hooks/useCart';
import { ShippingAddress } from '@/types/address';
import { STRIPE_CONFIG } from '@/config/stripe';
import AddressSelector from './AddressSelector';
import AddressForm from './AddressForm';
import OrderSummary from './OrderSummary';
import PaymentForm from './PaymentForm';
import Loading from '@/components/ui/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiArrowRight } from 'react-icons/fi';

type PaymentMethod = 'card' | 'afterpay' | 'klarna' | 'affirm';

const stripePromise = STRIPE_CONFIG.publishableKey
  ? loadStripe(STRIPE_CONFIG.publishableKey)
  : null;

export default function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart } = useCart();
  const [step, setStep] = useState<'address' | 'payment'>('address');

  // Filter cart items by URL params (from cart page selection)
  const selectedItemIds = useMemo(() => {
    const ids = searchParams?.getAll('items') || [];
    return ids.length > 0 ? new Set(ids) : null;
  }, [searchParams]);

  const checkoutItems = useMemo(() => {
    if (!cart?.items) return [];
    if (!selectedItemIds) return cart.items;
    return cart.items.filter((item) => {
      const productId = typeof item.product === 'string' ? item.product : (item.product as any)?._id;
      return productId && selectedItemIds.has(productId);
    });
  }, [cart?.items, selectedItemIds]);

  const summary = useMemo(() => {
    let totalItems = 0;
    let totalPrice = 0;
    checkoutItems.forEach((item) => {
      const product = typeof item.product === 'object' ? item.product : ({} as any);
      const price = product?.price ?? 0;
      const qty = item.quantity ?? 0;
      totalItems += qty;
      totalPrice += price * qty;
    });
    return { totalItems, totalPrice };
  }, [checkoutItems]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [couponType, setCouponType] = useState<'percentage' | 'fixed' | undefined>();
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const subtotal = summary.totalPrice;
  const shipping = 0;
  const tax = 0;
  const total = Math.max(0, subtotal - couponDiscount + shipping + tax);

  const handleAddressSelect = useCallback((address: ShippingAddress) => {
    setShippingAddress(address);
    setStep('payment');
  }, []);

  const handleCreateIntent = useCallback(async () => {
    if (!shippingAddress || !checkoutItems.length) return;
    setIsCreatingIntent(true);
    setPaymentError(null);
    try {
      const itemIds = checkoutItems.map((item) =>
        typeof item.product === 'string' ? item.product : (item.product as any)?._id
      ).filter(Boolean);
      const amount = total;
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'cad',
          shippingAddress,
          paymentMethod,
          itemIds,
          ...(couponCode && { couponCode }),
          ...(couponDiscount > 0 && { couponDiscount, couponType }),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create payment intent');
      if (data.clientSecret) setClientSecret(data.clientSecret);
      else throw new Error('No client secret returned');
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to initialize payment');
    } finally {
      setIsCreatingIntent(false);
    }
  }, [shippingAddress, checkoutItems, total, paymentMethod, couponCode, couponDiscount, couponType]);

  useEffect(() => {
    if (step === 'payment' && shippingAddress && !clientSecret && !isCreatingIntent) {
      handleCreateIntent();
    }
  }, [step, shippingAddress, clientSecret, isCreatingIntent, handleCreateIntent]);

  const handlePaymentSuccess = useCallback(
    (paymentIntentId: string) => {
      router.push(`/checkout/success?payment_intent=${paymentIntentId}`);
    },
    [router]
  );

  const handlePaymentError = useCallback((error: string) => {
    setPaymentError(error);
  }, []);

  const handleCouponApplied = useCallback(
    (discount: number, code?: string, type?: 'percentage' | 'fixed') => {
      setCouponDiscount(discount);
      setCouponCode(code);
      setCouponType(type);
      setClientSecret(null);
    },
    []
  );

  if (!cart) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading />
      </div>
    );
  }

  if (!cart.items?.length || !checkoutItems.length) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-lg text-gray-600 mb-4">Your cart is empty.</p>
        <button
          type="button"
          onClick={() => router.push('/products')}
          className="text-[#F9629F] hover:text-[#DB7093] font-semibold"
        >
          Continue shopping
        </button>
      </div>
    );
  }

  const options = clientSecret
    ? { clientSecret, appearance: { theme: 'stripe' as const } }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address & Payment */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {step === 'address' && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#F9629F]/10 rounded-lg">
                    <FiMapPin className="w-6 h-6 text-[#F9629F]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Shipping address</h2>
                </div>
                <AddressSelector onSelect={handleAddressSelect} />
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Or add a new address:</p>
                  <AddressForm
                    onSubmit={(addr) => handleAddressSelect(addr)}
                    buttonText="Use this address"
                  />
                </div>
              </motion.div>
            )}

            {step === 'payment' && shippingAddress && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-[#F9629F]/10 rounded-lg">
                    <FiCreditCard className="w-6 h-6 text-[#F9629F]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
                </div>
                {paymentError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                    {paymentError}
                  </div>
                )}
                {isCreatingIntent && !clientSecret && (
                  <div className="flex items-center justify-center py-12">
                    <Loading />
                  </div>
                )}
                {clientSecret && stripePromise && options && (
                  <Elements stripe={stripePromise} options={options}>
                    <PaymentForm
                      clientSecret={clientSecret}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      shippingAddress={shippingAddress}
                      paymentMethod={paymentMethod}
                      total={total}
                    />
                  </Elements>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Order summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            items={checkoutItems}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
            paymentMethod={paymentMethod}
            onCouponApplied={handleCouponApplied}
          />
        </div>
      </div>
    </div>
  );
}
