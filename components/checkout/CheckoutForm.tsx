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
import { FiMapPin, FiCreditCard, FiArrowRight, FiChevronDown, FiShoppingBag } from 'react-icons/fi';
import { formatCurrency } from '@/utils/currency';

type PaymentMethod = 'card' | 'afterpay' | 'klarna' | 'affirm';

const stripePromise = STRIPE_CONFIG.publishableKey
  ? loadStripe(STRIPE_CONFIG.publishableKey)
  : null;

export default function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart } = useCart();
  const selectedItemIds = useMemo(() => {
    const ids = searchParams?.getAll('items') || [];
    return ids.length > 0 ? new Set(ids) : null;
  }, [searchParams]);

  // Address from URL (cart selected address) – used for initial state so AddressSelector never overwrites it
  const addressFromUrl = useMemo(() => {
    const addressId = searchParams?.get('addressId');
    const fullName = searchParams?.get('fullName');
    const address = searchParams?.get('address');
    const city = searchParams?.get('city');
    const state = searchParams?.get('state');
    const zipCode = searchParams?.get('zipCode');
    const country = searchParams?.get('country');
    const phone = searchParams?.get('phone') ?? '';
    if (addressId === 'selected' && fullName && address && city && state && zipCode && country) {
      return {
        fullName,
        address,
        city,
        state,
        zipCode,
        country,
        phone,
      } as ShippingAddress;
    }
    return null;
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

  const [step, setStep] = useState<'address' | 'payment'>(() =>
    addressFromUrl ? 'payment' : 'address'
  );
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(() =>
    addressFromUrl
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [couponType, setCouponType] = useState<'percentage' | 'fixed' | undefined>();
  const [verificationDiscount, setVerificationDiscount] = useState(0);
  const [verificationDiscountSource, setVerificationDiscountSource] = useState<'phone' | 'email' | 'both' | null>(null);
  const [canBecomeVerificationEligible, setCanBecomeVerificationEligible] = useState(false);
  const [verificationEligibilityLoading, setVerificationEligibilityLoading] = useState(true);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [shippingFee, setShippingFee] = useState<number | null>(null);

  // On wide screens (laptop+), show order summary by default; keep collapsed on mobile/tablet
  useEffect(() => {
    const isWideScreen = typeof window !== 'undefined' && window.innerWidth >= 1024;
    if (isWideScreen) setOrderSummaryOpen(true);
  }, []);

  // Fetch verification discount eligibility (one-time $5 off for verified phone or email)
  useEffect(() => {
    let cancelled = false;
    setVerificationEligibilityLoading(true);
    setVerificationDiscount(0);
    setVerificationDiscountSource(null);
    setCanBecomeVerificationEligible(false);
    const fetchEligibility = async () => {
      try {
        const res = await fetch('/api/verification-discount/eligibility', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) {
          if (data.eligible && data.discount > 0) {
            setVerificationDiscount(data.discount);
            setVerificationDiscountSource(data.source || null);
          }
          setCanBecomeVerificationEligible(data.canBecomeEligible === true);
        }
      } catch {
        if (!cancelled) {
          setVerificationDiscount(0);
          setVerificationDiscountSource(null);
          setCanBecomeVerificationEligible(false);
        }
      } finally {
        if (!cancelled) setVerificationEligibilityLoading(false);
      }
    };
    fetchEligibility();
    return () => { cancelled = true; };
  }, []);

  // Fetch shipping fee when we have a shipping address
  useEffect(() => {
    if (!shippingAddress) {
      setShippingFee(null);
      return;
    }
    let cancelled = false;
    setShippingFee(null);
    setClientSecret(null); // Invalidate intent so we recreate with new shipping
    const fetchShipping = async () => {
      try {
        const res = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shippingAddress }),
        });
        const data = await res.json();
        if (!cancelled && data.shippingFee !== undefined) {
          setShippingFee(data.shippingFee);
        } else if (!cancelled) {
          setShippingFee(13); // fallback if API fails (standard $10 + $3 base)
        }
      } catch {
        if (!cancelled) setShippingFee(13);
      }
    };
    fetchShipping();
    return () => { cancelled = true; };
  }, [shippingAddress]);

  const subtotal = summary.totalPrice;
  const shipping = shippingFee ?? 0;
  const tax = 0;
  const total = Math.max(0, subtotal - couponDiscount - verificationDiscount + shipping + tax);

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
          ...(shipping > 0 && { shippingFee: shipping }),
          ...(couponCode && { couponCode }),
          ...(couponDiscount > 0 && { couponDiscount, couponType }),
          ...(verificationDiscount > 0 && {
            verificationDiscount,
            verificationDiscountSource: verificationDiscountSource || undefined,
          }),
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
  }, [shippingAddress, checkoutItems, total, paymentMethod, shipping, couponCode, couponDiscount, couponType, verificationDiscount, verificationDiscountSource]);

  useEffect(() => {
    if (
      step === 'payment' &&
      shippingAddress &&
      shippingFee !== null &&
      !clientSecret &&
      !isCreatingIntent &&
      !verificationEligibilityLoading
    ) {
      handleCreateIntent();
    }
  }, [step, shippingAddress, shippingFee, clientSecret, isCreatingIntent, verificationEligibilityLoading, handleCreateIntent]);

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
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe' as const,
          variables: {
            colorPrimary: '#050b2c',
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
            colorDanger: '#dc2626',
            borderRadius: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          },
          rules: {
            '.Tab': { border: '1px solid #e5e7eb', borderRadius: '10px' },
            '.Tab:hover': { borderColor: '#050b2c', backgroundColor: '#f9fafb' },
            '.Tab--selected': { borderColor: '#050b2c', backgroundColor: '#f8fafc', boxShadow: '0 0 0 2px rgba(5, 11, 44, 0.1)' },
            '.Input': { border: '1px solid #e5e7eb', borderRadius: '10px' },
            '.Input:focus': { borderColor: '#050b2c', boxShadow: '0 0 0 2px rgba(5, 11, 44, 0.1)' },
            '.Label': { fontWeight: '500' },
          },
        },
      }
    : null;

  const itemCount = summary.totalItems;
  const orderSummaryLabel = itemCount === 1 ? '1 item' : `${itemCount} items`;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
      {/* Top: Collapsible Order Summary */}
      <motion.div
        layout
        className="mb-5 sm:mb-8 rounded-xl sm:rounded-2xl shadow-xl border border-white/10 overflow-hidden bg-gradient-to-br from-[#000000] to-[#1a1a1a]"
      >
        <button
          type="button"
          onClick={() => setOrderSummaryOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-white/5 transition-colors touch-manipulation"
          aria-expanded={orderSummaryOpen}
          aria-controls="order-summary-content"
          id="order-summary-toggle"
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="bg-gradient-to-br from-[#F9629F] to-[#DB7093] p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-base sm:text-xl font-bold text-white truncate">Order Summary</span>
            <span className="text-white/70 text-sm sm:text-base font-medium whitespace-nowrap">
              • {orderSummaryLabel} • {formatCurrency(total)}
            </span>
          </div>
          <motion.span
            animate={{ rotate: orderSummaryOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 p-1 text-white/80"
            aria-hidden
          >
            <FiChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {orderSummaryOpen && (
            <motion.div
              id="order-summary-content"
              role="region"
              aria-labelledby="order-summary-toggle"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/20 px-0 pt-0">
                <OrderSummary
                  items={checkoutItems}
                  subtotal={subtotal}
                  shipping={shipping}
                  shippingLoading={shippingAddress !== null && shippingFee === null}
                  tax={tax}
                  total={total}
                  paymentMethod={paymentMethod}
                  onCouponApplied={handleCouponApplied}
                  verificationDiscount={verificationDiscount}
                  verificationDiscountSource={verificationDiscountSource}
                  canBecomeVerificationEligible={canBecomeVerificationEligible}
                  verificationEligibilityLoading={verificationEligibilityLoading}
                  compact
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main: Address & Payment (full width) */}
      <div className="max-w-3xl mx-auto min-w-0">
        <AnimatePresence mode="wait">
          {step === 'address' && (
            <motion.div
              key="address"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-200 p-4 sm:p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-[#F9629F]/10 rounded-lg flex-shrink-0">
                  <FiMapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#F9629F]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Shipping address</h2>
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
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
                <p className="text-sm text-gray-600">All transactions are secure and encrypted.</p>
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
                    onPaymentMethodChange={setPaymentMethod}
                  />
                </Elements>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
