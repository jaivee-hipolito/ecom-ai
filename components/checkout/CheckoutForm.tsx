'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '@/config/stripe';
import AddressForm from './AddressForm';
import AddressSelector from './AddressSelector';
import OrderSummary from './OrderSummary';
import PaymentForm from './PaymentForm';
// PaymentMethodSelector removed - defaulting to card payment
export type PaymentMethod = 'card' | 'afterpay' | 'klarna' | 'affirm';
import { ShippingAddress } from '@/types/address';
import { useCart } from '@/contexts/CartContext';
import Loading from '@/components/ui/Loading';
import Footer from '@/components/shared/Footer';
import Navbar from '@/components/shared/Navbar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiCreditCard, FiMapPin, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
// Tax is shouldered by owner/admin, so tax calculations are removed
import Link from 'next/link';
import { formatCurrency } from '@/utils/currency';

// Only load Stripe if publishable key is available
const stripePromise = STRIPE_CONFIG.publishableKey
  ? loadStripe(STRIPE_CONFIG.publishableKey)
  : null;

type CheckoutStep = 'address' | 'payment';

export default function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, getCartSummary, isLoading: cartLoading, refreshCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>('address');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [appliedCouponType, setAppliedCouponType] = useState<'percentage' | 'fixed' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isRecreatingIntent, setIsRecreatingIntent] = useState(false);
  const isCreatingIntentRef = useRef(false); // Prevent duplicate payment intent creation
  const lastPaymentMethodRef = useRef<PaymentMethod | null>(null); // Track last payment method to prevent unnecessary recreations

  // Get selected item IDs from URL params
  const selectedItemIds = searchParams?.getAll('items') || [];
  const selectedItemIdsSet = new Set(selectedItemIds);

  // Filter cart items to only include selected items
  const filteredCartItems = cart?.items?.filter((item) => {
    if (selectedItemIdsSet.size === 0) {
      // If no items param, include all items
      return true;
    }
    const productId = typeof item.product === 'string' ? item.product : item.product?._id || '';
    return selectedItemIdsSet.has(productId);
  }) || [];

  // Calculate summary based on filtered items
  const calculateFilteredSummary = () => {
    if (!filteredCartItems || filteredCartItems.length === 0) {
      return { totalItems: 0, totalPrice: 0 };
    }

    let totalItems = 0;
    let totalPrice = 0;

    filteredCartItems.forEach((item) => {
      const product = typeof item.product === 'object' ? item.product : ({} as any);
      const price = product.price || 0;
      const quantity = item.quantity || 0;

      totalItems += quantity;
      totalPrice += price * quantity;
    });

    return { totalItems, totalPrice };
  };

  const cartSummary = cart 
    ? (selectedItemIdsSet.size > 0 ? calculateFilteredSummary() : getCartSummary())
    : { totalItems: 0, totalPrice: 0, items: [] };

  const handleCouponApplied = async (discount: number, couponCode?: string, couponType?: 'percentage' | 'fixed') => {
    // Prevent duplicate payment intent creation
    if (isCreatingIntentRef.current) {
      console.log('[CheckoutForm] ⚠️ Payment intent creation already in progress, skipping handleCouponApplied...');
      return;
    }

    // Validate cart summary
    if (!cartSummary || typeof cartSummary.totalPrice !== 'number' || cartSummary.totalPrice <= 0) {
      console.error('[CheckoutForm] ❌ Invalid cart summary for coupon:', {
        cartSummary,
        totalPrice: cartSummary?.totalPrice,
      });
      return; // Don't throw error, just log and return
    }

    console.log('========================================');
    console.log('[CheckoutForm] 🎫 HANDLING COUPON APPLIED');
    console.log('========================================');
    console.log('Coupon Applied:', {
      discount,
      cartSummaryTotalPrice: cartSummary.totalPrice,
      hasClientSecret: !!clientSecret,
      hasShippingAddress: !!shippingAddress,
      timestamp: new Date().toISOString(),
    });

    setCouponDiscount(discount);
    // Reset coupon code and type when discount is 0 (coupon removed)
    if (discount === 0) {
      setAppliedCouponCode(null);
      setAppliedCouponType(null);
    } else {
      setAppliedCouponCode(couponCode || null);
      setAppliedCouponType(couponType || null);
    }
    
    // If payment intent already exists, we need to recreate it with new amount
    if (clientSecret && shippingAddress) {
      // Recalculate shipping if address exists
      let currentShipping = shippingFee;
      if (shippingAddress) {
        currentShipping = await calculateShipping(shippingAddress);
        setShippingFee(currentShipping);
      }
      
      isCreatingIntentRef.current = true;
      try {
        const shipping = currentShipping;
        const subtotalAfterDiscount = cartSummary.totalPrice - discount;
        
        // Validate subtotal after discount
        if (subtotalAfterDiscount <= 0) {
          console.error('[CheckoutForm] ❌ Invalid subtotal after coupon discount:', {
            cartSummaryTotalPrice: cartSummary.totalPrice,
            discount,
            subtotalAfterDiscount,
          });
          throw new Error('Discount amount cannot exceed order total');
        }
        
        // Calculate 6% BNPL fee - ONLY for Afterpay, Klarna, or Affirm (NOT for card payments)
        // BNPL fee is calculated on subtotal + shipping
        const BNPL_FEE_RATE = 0.06; // 6%
        const bnplFee = (paymentMethod === 'afterpay' || paymentMethod === 'klarna' || paymentMethod === 'affirm') 
          ? (subtotalAfterDiscount + shipping) * BNPL_FEE_RATE 
          : 0;
        
        // Tax is shouldered by owner/admin, so set to 0 for customers
        const tax = 0;
        const finalAmount = Math.max(0, subtotalAfterDiscount + bnplFee + shipping + tax);

        // Validate final amount
        if (!finalAmount || finalAmount <= 0 || !isFinite(finalAmount)) {
          console.error('[CheckoutForm] ❌ Invalid final amount after coupon:', {
            subtotalAfterDiscount,
            bnplFee,
            shipping,
            tax,
            finalAmount,
          });
          throw new Error('Invalid order amount after applying discount');
        }

        console.log('[CheckoutForm] Creating payment intent for coupon:', {
          cartSummaryTotalPrice: cartSummary.totalPrice,
          discount,
          subtotalAfterDiscount,
          bnplFee,
          finalAmount,
          timestamp: new Date().toISOString(),
        });

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: finalAmount,
            currency: 'usd',
            couponCode: appliedCouponCode,
            couponDiscount: discount,
            couponType: appliedCouponType,
          }),
        });

        if (response.ok) {
          const { clientSecret: newSecret } = await response.json();
          console.log('[CheckoutForm] ✅ Payment intent recreated for coupon');
          setClientSecret(newSecret);
        } else {
          console.error('[CheckoutForm] ❌ Failed to recreate payment intent for coupon');
        }
      } catch (err) {
        console.error('[CheckoutForm] ❌ Error updating payment intent:', err);
      } finally {
        isCreatingIntentRef.current = false;
        console.log('========================================\n');
      }
    }
  };

  // Calculate shipping fee based on address
  const calculateShipping = async (address: ShippingAddress): Promise<number> => {
    setIsCalculatingShipping(true);
    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shippingAddress: address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('[CheckoutForm] ⚠️ Shipping calculation failed:', errorData);
        // Return default shipping fee if calculation fails
        return 10;
      }

      const data = await response.json();
      console.log('[CheckoutForm] ✅ Shipping calculated:', {
        distance: data.distance,
        shippingFee: data.shippingFee,
        message: data.message,
      });
      
      return data.shippingFee || 0;
    } catch (error) {
      console.error('[CheckoutForm] ❌ Error calculating shipping:', error);
      // Return default shipping fee on error
      return 10;
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleAddressSubmit = async (address: ShippingAddress) => {
    // Prevent duplicate payment intent creation
    if (isCreatingIntentRef.current) {
      console.log('[CheckoutForm] ⚠️ Payment intent creation already in progress, skipping handleAddressSubmit...');
      return;
    }

    // Validate cart is loaded and has items
    if (!cart || !cart.items || cart.items.length === 0) {
      const errorMsg = 'Your cart is empty. Please add items to your cart before checkout.';
      console.error('[CheckoutForm] ❌ Cart is empty:', { cart, cartItems: cart?.items?.length });
      setError(errorMsg);
      return;
    }

    // Validate filtered items if itemIds are specified
    if (selectedItemIdsSet.size > 0 && filteredCartItems.length === 0) {
      const errorMsg = 'Selected items are no longer in your cart. Please refresh and try again.';
      console.error('[CheckoutForm] ❌ No matching items:', { 
        selectedItemIds: Array.from(selectedItemIdsSet),
        cartItems: cart.items.length,
        filteredItems: filteredCartItems.length,
      });
      setError(errorMsg);
      return;
    }

    console.log('========================================');
    console.log('[CheckoutForm] 📍 HANDLING ADDRESS SUBMIT');
    console.log('========================================');
    console.log('Address Submit:', {
      hasAddress: !!address,
      step,
      paymentMethod,
      cartItemsCount: cart.items.length,
      cartSummaryTotalPrice: cartSummary?.totalPrice,
      timestamp: new Date().toISOString(),
    });

    setShippingAddress(address);
    setIsProcessing(true);
    setError(null);

    try {
      // Calculate shipping fee
      const calculatedShipping = await calculateShipping(address);
      setShippingFee(calculatedShipping);

      isCreatingIntentRef.current = true;

      // Validate cart summary before proceeding
      if (!cartSummary || typeof cartSummary.totalPrice !== 'number' || cartSummary.totalPrice <= 0) {
        const errorMsg = 'Cart is empty or invalid. Please add items to your cart before checkout.';
        console.error('[CheckoutForm] ❌ Invalid cart summary:', {
          cartSummary,
          totalPrice: cartSummary?.totalPrice,
          cartItems: cart?.items?.length || 0,
        });
        throw new Error(errorMsg);
      }

      // Calculate final amount with discount
      const shipping = calculatedShipping;
      const subtotalAfterDiscount = cartSummary.totalPrice - couponDiscount;
      
      // Validate subtotal after discount
      if (subtotalAfterDiscount <= 0) {
        const errorMsg = 'Order total must be greater than zero. Please check your cart and discount code.';
        console.error('[CheckoutForm] ❌ Invalid subtotal after discount:', {
          cartSummaryTotalPrice: cartSummary.totalPrice,
          couponDiscount,
          subtotalAfterDiscount,
        });
        throw new Error(errorMsg);
      }
      
      // Calculate 6% BNPL fee - ONLY for Afterpay, Klarna, or Affirm (NOT for card payments)
      // IMPORTANT: When paymentMethod is 'card', Stripe's PaymentElement uses automatic_payment_methods
      // which includes BNPL options (Affirm, Klarna). We need to include the BNPL fee in the payment
      // intent amount so that if the user selects a BNPL method, the correct amount is charged.
      // If the user actually pays with a card, we'll detect it and adjust the order amount accordingly.
      const BNPL_FEE_RATE = 0.06; // 6%
      
      // Include BNPL fee if:
      // 1. Payment method is explicitly BNPL (afterpay, klarna, affirm), OR
      // 2. Payment method is 'card' (which uses automatic_payment_methods that includes BNPL options)
      //    We include the fee because user might select BNPL through Stripe's PaymentElement
      const isExplicitBNPL = paymentMethod === 'afterpay' || paymentMethod === 'klarna' || paymentMethod === 'affirm';
      const isCardWithBNPLOptions = paymentMethod === 'card'; // Card uses automatic_payment_methods which includes BNPL
      
      // Include BNPL fee when BNPL methods are available (either explicitly or through automatic methods)
      // This ensures the correct amount (with fee) is sent to Stripe if user selects BNPL
      // If user pays with card, the order creation APIs will handle removing the fee from order total
      // BNPL fee is calculated on subtotal + shipping
      const bnplFee = (isExplicitBNPL || isCardWithBNPLOptions) 
        ? (subtotalAfterDiscount + shipping) * BNPL_FEE_RATE 
        : 0;
      
      // Tax is shouldered by owner/admin, so set to 0 for customers
      const tax = 0;
      const finalAmount = Math.max(0, subtotalAfterDiscount + bnplFee + shipping + tax);

      // Validate final amount before creating payment intent
      if (!finalAmount || finalAmount <= 0 || !isFinite(finalAmount)) {
        const errorMsg = `Invalid order amount: $${finalAmount}. Please check your cart.`;
        console.error('[CheckoutForm] ❌ Invalid final amount:', {
          subtotalAfterDiscount,
          bnplFee,
          shipping,
          tax,
          finalAmount,
          cartSummaryTotalPrice: cartSummary.totalPrice,
          couponDiscount,
        });
        throw new Error(errorMsg);
      }

      // Determine currency based on shipping address country
      // Afterpay in Canada requires CAD currency
      const currency = address.country === 'CA' ? 'cad' : 'usd';
      
      // Create payment intent with shipping address for tax calculation
      // Amount includes BNPL fee so Stripe shows correct installment amounts for Afterpay/Klarna/Affirm
      console.log('[CheckoutForm] Creating payment intent:', {
        cartSummaryTotalPrice: cartSummary.totalPrice,
        couponDiscount,
        subtotalAfterDiscount,
        bnplFee,
        shipping,
        tax,
        finalAmount,
        currency,
        paymentMethod: paymentMethod || 'card',
        timestamp: new Date().toISOString(),
      });

      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount, // This includes BNPL fee when BNPL methods are available
          currency: currency,
          shippingAddress: address, // Pass shipping address for tax calculation
          paymentMethod: paymentMethod || 'card', // Pass payment method to ensure Afterpay is supported
          couponCode: appliedCouponCode,
          couponDiscount: couponDiscount,
          couponType: appliedCouponType,
          // Note: billingAddress will be passed when creating payment intent for Afterpay
        }),
      });

      if (!response.ok) {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.error('[CheckoutForm] ❌ Payment intent creation failed:', {
            status: response.status,
            error: data.error,
            finalAmount,
            currency,
            paymentMethod,
          });
          throw new Error(data.error || 'Failed to create payment intent');
        } else {
          // Response is not JSON (likely HTML error page)
          const text = await response.text();
          console.error('[CheckoutForm] ❌ Non-JSON response:', {
            status: response.status,
            statusText: response.statusText,
            responsePreview: text.substring(0, 200),
            finalAmount,
            currency,
            paymentMethod,
          });
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const { clientSecret: secret } = await response.json();
      console.log('[CheckoutForm] ✅ Payment intent created successfully');
      setClientSecret(secret);
      setStep('payment');
    } catch (err: any) {
      console.error('[CheckoutForm] ❌ Error creating payment intent:', err);
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setIsProcessing(false);
      isCreatingIntentRef.current = false;
      console.log('========================================\n');
    }
  };

  // Check if address is provided via URL params (from cart page)
  useEffect(() => {
    // Don't auto-submit if cart is still loading or empty
    if (cartLoading || !cart || !cart.items || cart.items.length === 0) {
      return;
    }

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
  }, [searchParams, cart, cartLoading]);

  useEffect(() => {
    // Don't redirect if we're processing payment (prevents redirect during payment completion)
    if (isProcessing) {
      return;
    }
    
    if (!cart || cart.items.length === 0) {
      router.push('/dashboard/cart');
      return;
    }
    
    // If items are specified in URL but none match, redirect back to cart
    if (selectedItemIdsSet.size > 0 && filteredCartItems.length === 0) {
      router.push('/dashboard/cart');
      return;
    }
  }, [cart, router, selectedItemIdsSet.size, filteredCartItems.length, isProcessing]);

  // Recreate payment intent when payment method changes to Afterpay
  useEffect(() => {
    const recreatePaymentIntentForAfterpay = async () => {
      // Guard: Only recreate if switching TO Afterpay and we're on payment step
      // Also check if payment method actually changed to prevent duplicate calls
      const paymentMethodChanged = lastPaymentMethodRef.current !== paymentMethod;
      const shouldRecreate = paymentMethod === 'afterpay' && 
                            step === 'payment' && 
                            shippingAddress && 
                            !isCreatingIntentRef.current &&
                            paymentMethodChanged;
      
      if (!shouldRecreate) {
        // Update ref even if we don't recreate
        lastPaymentMethodRef.current = paymentMethod;
        return;
      }

      // Prevent duplicate creation
      if (isCreatingIntentRef.current) {
        console.log('[CheckoutForm] ⚠️ Payment intent creation already in progress, skipping...');
        return;
      }

      console.log('========================================');
      console.log('[CheckoutForm] 🔄 RECREATING PAYMENT INTENT FOR AFTERPAY');
      console.log('========================================');
      console.log('Recreation Trigger:', {
        paymentMethod,
        previousPaymentMethod: lastPaymentMethodRef.current,
        step,
        hasShippingAddress: !!shippingAddress,
        hasClientSecret: !!clientSecret,
        timestamp: new Date().toISOString(),
      });

      isCreatingIntentRef.current = true;
      setIsRecreatingIntent(true);
      lastPaymentMethodRef.current = paymentMethod;
      
      // Clear current clientSecret to force PaymentElement to unmount
      const oldSecret = clientSecret;
      setClientSecret(null);
      
      try {
        const shipping = shippingFee;
        const subtotalAfterDiscount = cartSummary.totalPrice - couponDiscount;
        
        // Calculate 6% BNPL fee - ONLY for Afterpay, Klarna, or Affirm (NOT for card payments)
        // BNPL fee is calculated on subtotal + shipping
        const BNPL_FEE_RATE = 0.06; // 6%
        const bnplFee = (paymentMethod === 'afterpay' || paymentMethod === 'klarna' || paymentMethod === 'affirm') 
          ? (subtotalAfterDiscount + shipping) * BNPL_FEE_RATE 
          : 0;
        
        // Tax is shouldered by owner/admin, so set to 0 for customers
        const tax = 0;
        const finalAmount = Math.max(0, subtotalAfterDiscount + bnplFee + shipping + tax);

        // Determine currency based on shipping address country
        // Afterpay in Canada requires CAD currency
        const currency = shippingAddress.country === 'CA' ? 'cad' : 'usd';
        
        console.log('[CheckoutForm] Creating payment intent with:', {
          amount: finalAmount,
          currency,
          paymentMethod: 'afterpay',
          timestamp: new Date().toISOString(),
        });

        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: finalAmount,
            currency: currency,
            shippingAddress: shippingAddress,
            paymentMethod: 'afterpay',
            itemIds: selectedItemIdsSet.size > 0 ? Array.from(selectedItemIdsSet) : undefined,
            couponCode: appliedCouponCode,
            couponDiscount: couponDiscount,
            couponType: appliedCouponType,
          }),
        });

        if (response.ok) {
          const { clientSecret: newSecret } = await response.json();
          console.log('[CheckoutForm] ✅ Payment intent recreated successfully');
          setClientSecret(newSecret);
        } else {
          const errorData = await response.json();
          console.error('[CheckoutForm] ❌ Failed to recreate payment intent:', errorData);
          setError(errorData.error || 'Failed to initialize Afterpay payment');
          // Restore old secret on error
          if (oldSecret) setClientSecret(oldSecret);
        }
      } catch (err) {
        console.error('[CheckoutForm] ❌ Error recreating payment intent for Afterpay:', err);
        setError('Failed to initialize Afterpay payment');
        // Restore old secret on error
        if (oldSecret) setClientSecret(oldSecret);
      } finally {
        setIsRecreatingIntent(false);
        isCreatingIntentRef.current = false;
        console.log('========================================\n');
      }
    };

    recreatePaymentIntentForAfterpay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, step, shippingAddress]);

  const handlePaymentSuccess = async (paymentIntentId: string, billingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }, detectedPaymentMethod?: string) => {
    if (!shippingAddress) {
      setError('Shipping address is required');
      return;
    }

    if (!billingAddress) {
      setError('Billing address is required');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Use detected payment method if available (e.g., Affirm detected from PaymentElement)
      // Normalize payment method names (Stripe uses 'afterpay_clearpay' but we use 'afterpay')
      let normalizedPaymentMethod = detectedPaymentMethod || paymentMethod;
      if (normalizedPaymentMethod === 'afterpay_clearpay') {
        normalizedPaymentMethod = 'afterpay';
      }
      
      // For redirect-based payments (Afterpay, Klarna), don't create order here
      // The webhook will create the order when payment succeeds (payment_intent.succeeded)
      const isRedirectPayment = normalizedPaymentMethod === 'afterpay' || normalizedPaymentMethod === 'klarna';
      
      let orderData: any = null;
      
      if (!isRedirectPayment) {
        // For non-redirect payments (card, Affirm), create order immediately
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shippingAddress,
            billingAddress: billingAddress,
            paymentMethod: normalizedPaymentMethod,
            paymentIntentId,
            itemIds: selectedItemIdsSet.size > 0 ? Array.from(selectedItemIdsSet) : undefined,
            paymentStatus: 'paid',
          }),
        });

        if (!orderResponse.ok) {
          const data = await orderResponse.json();
          throw new Error(data.error || 'Failed to create order');
        }

        orderData = await orderResponse.json();
        console.log('Order created successfully:', orderData._id);

        // If card payment was used but payment intent included BNPL fee, create a refund for the fee
        if (normalizedPaymentMethod === 'card') {
          const shipping = shippingFee;
          const subtotalAfterDiscount = cartSummary.totalPrice - couponDiscount;
          const BNPL_FEE_RATE = 0.06;
          // BNPL fee is calculated on subtotal + shipping
          const bnplFee = (subtotalAfterDiscount + shipping) * BNPL_FEE_RATE;
          
          // Check if payment intent amount includes BNPL fee by comparing with order total
          // If payment intent amount is higher than order total, it likely includes BNPL fee
          try {
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
              // If payment intent amount (in cents) is significantly higher than order total,
              // it likely includes BNPL fee that needs to be refunded
              const paymentIntentAmount = verifyData.paymentIntent?.amount || 0;
              const orderTotalInCents = Math.round(orderData.totalAmount * 100);
              const expectedCardAmountInCents = Math.round((subtotalAfterDiscount + shipping) * 100);
              
              // If payment intent amount is higher than expected card amount, refund the difference
              if (paymentIntentAmount > expectedCardAmountInCents) {
                const refundAmount = (paymentIntentAmount - expectedCardAmountInCents) / 100;
                console.log(`Card payment detected with BNPL fee included. Creating refund of $${refundAmount}...`);
                
                try {
                  const refundResponse = await fetch('/api/payments/refund-bnpl-fee', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      paymentIntentId,
                      refundAmount,
                    }),
                  });

                  if (refundResponse.ok) {
                    const refundData = await refundResponse.json();
                    console.log('BNPL fee refunded successfully:', refundData.refundId);
                  } else {
                    console.warn('Failed to create BNPL fee refund:', await refundResponse.text());
                    // Don't fail the order creation if refund fails - can be handled manually
                  }
                } catch (refundError) {
                  console.error('Error creating BNPL fee refund:', refundError);
                  // Don't fail the order creation if refund fails
                }
              }
            }
          } catch (verifyError) {
            console.error('Error verifying payment intent for refund:', verifyError);
            // Don't fail the order creation if verification fails
          }
        }
      } else {
        // For redirect payments, order will be created by webhook when payment succeeds
        // Payment intent metadata already contains order data (shippingAddress, itemIds, etc.)
        console.log('Redirect payment - order will be created by webhook when payment succeeds');
      }

      // Only redirect to success page if order was created successfully (for non-redirect payments)
      // For redirect payments, Stripe will handle the redirect
      if (!isRedirectPayment && orderData) {
        // Redirect to success page FIRST, before refreshing cart
        // This prevents the cart empty check from redirecting to /dashboard/cart
        router.push(`/checkout/success?payment_intent=${paymentIntentId}`);

        // Refresh cart after redirect (this happens in background)
        try {
          await refreshCart();
          
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
        } catch (refreshError) {
          // Log but don't fail - cart refresh is not critical
          console.warn('Cart refresh failed, but order created:', refreshError);
        }
      } else if (isRedirectPayment) {
        // For redirect payments, Stripe will handle the redirect to success page
        // Don't redirect here - let Stripe handle it
      } else {
        // Order creation failed - don't redirect
        throw new Error('Failed to create order');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete order');
      setIsProcessing(false);
      // Don't redirect to success page on error
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

  if (!cart || cart.items.length === 0 || (selectedItemIdsSet.size > 0 && filteredCartItems.length === 0)) {
    return null;
  }

  const shipping = shippingFee;
  const subtotalAfterDiscount = cartSummary.totalPrice - couponDiscount;
  
  // Calculate 6% BNPL fee - ONLY for Afterpay, Klarna, or Affirm (NOT for card payments)
  // IMPORTANT: When paymentMethod is 'card', Stripe's PaymentElement uses automatic_payment_methods
  // which includes BNPL options (Affirm, Klarna). However, for display purposes, we only show
  // the BNPL fee if a BNPL method is explicitly selected. The payment intent amount will include
  // the fee when BNPL methods are available (handled in handleAddressSubmit).
  // BNPL fee is calculated on subtotal + shipping
  const BNPL_FEE_RATE = 0.06; // 6%
  const bnplFee = (paymentMethod === 'afterpay' || paymentMethod === 'klarna' || paymentMethod === 'affirm') 
    ? (subtotalAfterDiscount + shipping) * BNPL_FEE_RATE 
    : 0;
  
  // Tax is shouldered by owner/admin, so set to 0 for customers
  const tax = 0;
  const total = Math.max(0, subtotalAfterDiscount + bnplFee + shipping + tax);

  // Build cart URL with selected items preserved
  const getCartUrl = () => {
    if (selectedItemIdsSet.size > 0) {
      const params = new URLSearchParams();
      selectedItemIds.forEach((id) => {
        params.append('items', id);
      });
      return `/dashboard/cart?${params.toString()}`;
    }
    return '/dashboard/cart';
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden flex flex-col">
      <DashboardSidebar />
      <div id="dashboard-content" className="w-full lg:pl-64 transition-all duration-300 pt-16 lg:pt-0 overflow-x-hidden flex flex-col flex-1">
        <Navbar />
        <main className="py-8 px-2 sm:px-4 md:px-6 lg:px-8 w-full max-w-full flex-1 overflow-x-hidden">
          <div className="max-w-7xl mx-auto overflow-visible">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link href={getCartUrl()}>
            <motion.button
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-gray-600 hover:text-[#ffa509] transition-colors group"
            >
              <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm sm:text-base">Back to Cart</span>
            </motion.button>
          </Link>
        </motion.div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 overflow-visible">
          {/* Main Content - Address Form */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1 overflow-visible">
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

              {step === 'payment' && clientSecret && shippingAddress && (
                <>
                  <motion.div
                    key="shipping-display"
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

                  {/* Payment Form - On Left Side (Desktop), Below Order Summary (Mobile) */}
                  <motion.div
                    key="payment-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100 space-y-6 overflow-visible"
                  >
                    {/* Payment Header */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
                      <p className="text-sm text-gray-600">All transactions are secure and encrypted.</p>
                    </div>

                    {/* Stripe Payment Element - Show for Credit Card, Afterpay, and Affirm */}
                    {(paymentMethod === 'card' || paymentMethod === 'afterpay' || paymentMethod === 'affirm') && (
                      <>
                        {!stripePromise ? (
                          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-yellow-800">
                            <p>Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.</p>
                          </div>
                        ) : isRecreatingIntent ? (
                          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-blue-800">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              <p>Initializing Afterpay payment...</p>
                            </div>
                          </div>
                        ) : clientSecret ? (
                          <Elements
                            key={`${paymentMethod}-${clientSecret}`} // Force re-render when payment method or clientSecret changes
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
                              shippingAddress={shippingAddress}
                              paymentMethod={paymentMethod}
                              total={total}
                              onRecreateIntent={(newClientSecret) => {
                                setClientSecret(newClientSecret);
                              }}
                            />
                          </Elements>
                        ) : (
                          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-yellow-800">
                            <p>Loading payment options...</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Klarna Info */}
                    {paymentMethod === 'klarna' && (
                      <div className="mb-4 p-4 bg-white border-2 border-[#ffb3c7] rounded-lg shadow-md">
                        <p className="text-base font-bold text-gray-900 mb-3">
                          💳 Pay with Klarna
                        </p>
                        {/* Installment amounts - total already includes 6% fee */}
                        {total > 0 && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-[#ffb3c7]">
                            <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">4 payments of:</p>
                            <p className="text-2xl font-black text-[#050b2c] mb-1">
                              {formatCurrency(total / 4)}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              <span className="font-semibold">(includes 6% BNPL fee)</span>
                            </p>
                            <p className="text-sm text-gray-700 font-semibold border-t border-gray-200 pt-2 mt-2">
                              Total: <span className="text-[#050b2c]">{formatCurrency(total)}</span>
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-700">
                          Click the button below to complete your purchase. You'll be redirected to Klarna to finish checkout.
                        </p>
                      </div>
                    )}

                    {/* Klarna Payment Button - Redirect */}
                    {paymentMethod === 'klarna' && (
                      <motion.button
                        onClick={async () => {
                          if (!shippingAddress) {
                            setError('Shipping address is required');
                            return;
                          }

                          setIsProcessing(true);
                          setError(null);

                          try {
                            // Create order first (pending status)
                            const orderResponse = await fetch('/api/orders', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                shippingAddress,
                                billingAddress: shippingAddress, // Use shipping as billing for BNPL
                                paymentMethod: paymentMethod,
                                paymentIntentId: null, // No payment intent for BNPL redirects
                                itemIds: selectedItemIdsSet.size > 0 ? Array.from(selectedItemIdsSet) : undefined,
                                status: 'pending', // Set as pending until BNPL payment completes
                              }),
                            });

                            if (!orderResponse.ok) {
                              const data = await orderResponse.json();
                              throw new Error(data.error || 'Failed to create order');
                            }

                            // Refresh cart to reflect removed items
                            await refreshCart();

                            // Redirect to Klarna checkout (this button only renders when paymentMethod === 'klarna')
                            window.location.href = `https://www.klarna.com/us/checkout/?amount=${total.toFixed(2)}&currency=CAD`;
                          } catch (err: any) {
                            setError(err.message || 'Failed to initiate payment');
                            setIsProcessing(false);
                          }
                        }}
                        disabled={isProcessing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-[#ffa509] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffa509] text-white border-none shadow-xl hover:shadow-2xl py-4 px-6 text-lg font-bold transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Redirecting...</span>
                          </>
                        ) : (
                          <>
                            <FiCreditCard className="w-5 h-5" />
                            <span>Pay Now</span>
                            <FiArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar - First on Mobile, Right Side on Desktop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1 order-1 lg:order-2"
          >
            <OrderSummary
              items={filteredCartItems}
              subtotal={cartSummary.totalPrice}
              shipping={shipping}
              tax={tax}
              total={total}
              bnplFee={bnplFee}
              paymentMethod={paymentMethod}
              onCouponApplied={handleCouponApplied}
            />
          </motion.div>
        </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
