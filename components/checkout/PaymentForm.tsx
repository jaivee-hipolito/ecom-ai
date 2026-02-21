'use client';

import { useState, useEffect, FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { FiLock, FiCreditCard, FiArrowRight, FiMapPin } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import { formatCurrency } from '@/utils/currency';
import { useAuth } from '@/contexts/AuthContext';

interface BillingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string, billingAddress?: BillingAddress, detectedPaymentMethod?: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  } | null;
  paymentMethod?: 'card' | 'afterpay' | 'klarna' | 'affirm';
  total?: number;
  onRecreateIntent?: (newClientSecret: string) => void;
  onPaymentMethodChange?: (method: 'card' | 'afterpay' | 'klarna' | 'affirm') => void;
}

export default function PaymentForm({
  clientSecret,
  onSuccess,
  onError,
  isLoading = false,
  shippingAddress,
  paymentMethod = 'card',
  total = 0,
  onRecreateIntent,
  onPaymentMethodChange,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [afterpayAvailable, setAfterpayAvailable] = useState<boolean | null>(null);
  const [selectedPaymentMethodType, setSelectedPaymentMethodType] = useState<string | null>(null);
  const [useAccordionLayout, setUseAccordionLayout] = useState(false);

  // On mobile/tablet use accordion so all methods show as rows (no “more” dropdown); desktop keeps tabs
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const setLayout = () => setUseAccordionLayout(mq.matches);
    setLayout();
    mq.addEventListener('change', setLayout);
    return () => mq.removeEventListener('change', setLayout);
  }, []);

  // Hide Stripe's default installment text and show our own
  // Also hide when paymentMethod is 'card' since PaymentElement shows Afterpay/Klarna options
  useEffect(() => {
    if (paymentMethod !== 'afterpay' && paymentMethod !== 'klarna' && paymentMethod !== 'card') {
      return;
    }

    let observer: MutationObserver | null = null;
    let interval: NodeJS.Timeout | null = null;

    const hideStripeInstallmentText = () => {
      // Find PaymentElement container - try multiple selectors including wrapper
      const selectors = [
        '.stripe-payment-element-wrapper',
        '[data-testid="payment-element"]',
        '[id*="payment-element"]',
        '.StripeElement',
        '[class*="PaymentElement"]',
        '[class*="payment-element"]'
      ];
      
      let paymentElement: Element | null = null;
      for (const selector of selectors) {
        paymentElement = document.querySelector(selector);
        if (paymentElement) break;
      }
      
      if (!paymentElement) return;

      // Hide only small text elements (p, span) that show installment amounts – never divs/labels so we don’t collapse tab content
      const hideElements = () => {
        const allElements = paymentElement!.querySelectorAll('p, span');
        allElements.forEach((el) => {
          // Never touch tab UI – otherwise tabs won’t expand when clicked
          if (el.closest('[role="tab"]') || el.closest('[role="tabpanel"]') || el.closest('[role="tablist"]')) return;
          if (el.closest('button') || el.tagName === 'BUTTON') return;

          const text = (el.textContent || '').trim();
          const html = (el.innerHTML || '').trim();
          // Only hide if this looks like a standalone installment line (avoid hiding wrappers)
          const shouldHide =
            (text.includes('CA$') && (text.includes('Pay in 4') || text.includes('payments of') || text.includes('interest-free'))) ||
            (text.includes('Pay in 4') && text.includes('CA$')) ||
            text.includes('6–12 months') ||
            (text.match(/CA\$\d+\.\d+/) && text.length < 120) ||
            (html.includes('CA$') && html.includes('Pay in 4') && (el.textContent || '').length < 120);

          if (shouldHide) {
            const htmlEl = el as HTMLElement;
            htmlEl.style.visibility = 'hidden';
            htmlEl.style.height = '0';
            htmlEl.style.margin = '0';
            htmlEl.style.padding = '0';
            htmlEl.style.overflow = 'hidden';
            htmlEl.style.lineHeight = '0';
            htmlEl.style.fontSize = '0';
          }
        });
      };

      // Run immediately
      hideElements();

      // Use MutationObserver to catch dynamically added content
      observer = new MutationObserver(() => {
        hideElements();
      });

      observer.observe(paymentElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: false,
      });

      // Also use interval as backup - check more frequently
      interval = setInterval(hideElements, 100);
      
      // Keep running for longer to catch all dynamic content
      setTimeout(() => {
        if (interval) clearInterval(interval);
        if (observer) observer.disconnect();
      }, 15000);
    };

    // Wait for PaymentElement to be rendered, then start hiding
    const timeout = setTimeout(() => {
      hideStripeInstallmentText();
    }, 300);

    // Also try immediately in case it's already rendered
    hideStripeInstallmentText();

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
      if (observer) observer.disconnect();
    };
  }, [paymentMethod, clientSecret]);

  // Check if Afterpay is available when payment method is Afterpay
  useEffect(() => {
    const checkAfterpayAvailability = async () => {
      if (paymentMethod === 'afterpay' && stripe && elements && clientSecret) {
        try {
          // Retrieve the payment intent to check available payment methods
          const paymentIntentId = clientSecret.split('_secret_')[0];
          const paymentIntent = await stripe.retrievePaymentIntent(clientSecret);
          
          if (paymentIntent.paymentIntent) {
            const pi = paymentIntent.paymentIntent as any;
            const types = pi.payment_method_types || [];
            const usesAutomatic = pi.automatic_payment_methods?.enabled === true;
            const hasAfterpay = types.includes('afterpay_clearpay');
            // With automatic_payment_methods, types may be empty; Stripe still shows enabled methods (e.g. Afterpay)
            const available = hasAfterpay || (usesAutomatic && types.length === 0);
            setAfterpayAvailable(available);

            if (!available && types.length > 0) {
              setMessage('Afterpay is not available. Please ensure Afterpay is enabled in your Stripe dashboard and the order meets minimum requirements.');
            }
          }
        } catch (err) {
          console.error('Failed to check Afterpay availability:', err);
          setAfterpayAvailable(false);
        }
      } else {
        setAfterpayAvailable(null);
      }
    };

    checkAfterpayAvailability();
  }, [paymentMethod, stripe, elements, clientSecret]);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    fullName: shippingAddress?.fullName || '',
    address: shippingAddress?.address || '',
    city: shippingAddress?.city || '',
    state: shippingAddress?.state || '',
    zipCode: shippingAddress?.zipCode || '',
    country: shippingAddress?.country || 'CA',
    phone: shippingAddress?.phone || '',
  });

  // Sync billing with shipping when "use shipping as billing" is checked (default)
  useEffect(() => {
    if (useShippingAsBilling && shippingAddress) {
      setBillingAddress({
        fullName: shippingAddress.fullName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone || '',
      });
    }
  }, [useShippingAsBilling, shippingAddress]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      // First, submit the elements to validate the form (this validates billing address too)
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setMessage(submitError.message || 'Form validation failed. Please check your billing address.');
        onError(submitError.message || 'Form validation failed');
        setIsProcessing(false);
        return;
      }

      // Validate billing address is complete
      if (!billingAddress.fullName || !billingAddress.address || !billingAddress.city || 
          !billingAddress.state || !billingAddress.zipCode || !billingAddress.country) {
        setMessage('Please complete all billing address fields');
        onError('Billing address is required');
        setIsProcessing(false);
        return;
      }

      // Confirm the payment with billing address (required by Stripe)
      // For Afterpay, we need to allow redirects
      const redirectBehavior: 'always' = 'always';
      
      const result = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          payment_method_data: {
            billing_details: {
              name: billingAddress.fullName,
              email: user?.email ?? undefined,
              phone: billingAddress.phone?.trim() ?? '',
              address: {
                line1: billingAddress.address,
                city: billingAddress.city,
                state: billingAddress.state,
                postal_code: billingAddress.zipCode,
                country: billingAddress.country,
              },
            },
          },
        },
        redirect: redirectBehavior,
      });

      const { error, paymentIntent } = result as any;

      // Check if Affirm, Afterpay, or Klarna was actually used in the confirmed payment
      // This is the MOST RELIABLE way to detect the payment method
      const actualPaymentMethod = paymentIntent?.payment_method_types?.[0];
      const actualPaymentMethodTypes = paymentIntent?.payment_method_types || [];
      
      // Get the actual payment method object to check its type
      let actualPaymentMethodType = actualPaymentMethod;
      if (paymentIntent?.payment_method && typeof paymentIntent.payment_method === 'object') {
        actualPaymentMethodType = paymentIntent.payment_method.type;
      } else if (paymentIntent?.payment_method) {
        // If it's a string ID, we can't retrieve it client-side
        // Use the first payment method type as fallback
        actualPaymentMethodType = actualPaymentMethod;
      }
      
      // Check if BNPL methods were used based on ACTUAL confirmed payment method
      const usedAffirm = actualPaymentMethodType === 'affirm' || actualPaymentMethod === 'affirm';
      const usedAfterpay = actualPaymentMethodType === 'afterpay_clearpay' || 
                          actualPaymentMethodType === 'afterpay' ||
                          actualPaymentMethod === 'afterpay_clearpay' || 
                          actualPaymentMethod === 'afterpay';
      const usedKlarna = actualPaymentMethodType === 'klarna' || actualPaymentMethod === 'klarna';

      // Determine the actual payment method used
      let detectedPaymentMethod = paymentMethod;
      if (usedAffirm) {
        detectedPaymentMethod = 'affirm';
      } else if (usedAfterpay) {
        detectedPaymentMethod = 'afterpay';
      } else if (usedKlarna) {
        detectedPaymentMethod = 'klarna';
      } else if (actualPaymentMethod === 'card' || !actualPaymentMethod) {
        detectedPaymentMethod = 'card';
      }
      
      if (error) {
        setMessage(error.message || 'An error occurred');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded!');
        // Pass detected payment method (card, affirm, afterpay, or klarna)
        onSuccess(paymentIntent.id, billingAddress, detectedPaymentMethod);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Handle 3D Secure or redirect-based payments (e.g. Afterpay)
        // For redirect-based payments, create order before redirect
        // Stripe will handle the redirect automatically
        if (detectedPaymentMethod === 'afterpay' || detectedPaymentMethod === 'klarna' || 
            paymentMethod === 'afterpay' || paymentMethod === 'klarna') {
          setMessage('Creating order and redirecting to complete your payment...');
          // Create order before redirect - payment will be verified after redirect
          onSuccess(paymentIntent.id, billingAddress, detectedPaymentMethod);
          // Note: Stripe will automatically redirect after this
        } else {
          setMessage('Payment requires additional authentication');
        }
      } else if (paymentIntent && paymentIntent.status === 'processing') {
        // Payment is processing (common for Afterpay)
        setMessage('Payment is being processed...');
        onSuccess(paymentIntent.id, billingAddress, detectedPaymentMethod);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseShippingToggle = (checked: boolean) => {
    setUseShippingAsBilling(checked);
    if (checked && shippingAddress) {
      setBillingAddress({
        fullName: shippingAddress.fullName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone || '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      {/* Billing Address first – see address before paying */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FiMapPin className="w-5 h-5 text-[#F9629F] flex-shrink-0" />
            Billing Address
          </h3>
        </div>

        {/* Use Shipping Address Checkbox */}
        {shippingAddress && (
          <label className="flex items-start sm:items-center gap-3 cursor-pointer p-3 sm:p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors touch-manipulation">
            <input
              type="checkbox"
              checked={useShippingAsBilling}
              onChange={(e) => handleUseShippingToggle(e.target.checked)}
              className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 sm:mt-0 flex-shrink-0 text-[#F9629F] border-gray-300 rounded focus:ring-[#F9629F] focus:ring-2"
            />
            <span className="text-xs sm:text-sm text-gray-700">Use shipping address as billing address</span>
          </label>
        )}

        {/* Billing Address Form */}
        {!useShippingAsBilling && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 sm:space-y-4 bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200"
          >
            <Input
              label="Full Name"
              name="fullName"
              value={billingAddress.fullName}
              onChange={handleBillingChange}
              required
              placeholder="Enter full name"
            />

            <Input
              label="Address"
              name="address"
              value={billingAddress.address}
              onChange={handleBillingChange}
              required
              placeholder="Street address"
            />

            <Input
              label="Phone"
              name="phone"
              value={billingAddress.phone}
              onChange={handleBillingChange}
              required
              placeholder="e.g. 2505551234"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                value={billingAddress.city}
                onChange={handleBillingChange}
                required
                placeholder="City"
              />

              <Input
                label="State/Province"
                name="state"
                value={billingAddress.state}
                onChange={handleBillingChange}
                required
                placeholder="State/Province"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Postal/ZIP Code"
                name="zipCode"
                value={billingAddress.zipCode}
                onChange={handleBillingChange}
                required
                placeholder="Postal/ZIP Code"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  name="country"
                  value={billingAddress.country}
                  onChange={handleBillingChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] transition-all bg-white text-gray-900 font-medium"
                >
                  <option value="CA">Canada</option>
                  <option value="US">United States</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Display Billing Address if using shipping address */}
        {useShippingAsBilling && shippingAddress && (
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
            <div className="text-xs sm:text-sm text-gray-700 space-y-1">
              <p className="font-semibold">{billingAddress.fullName}</p>
              <p>{billingAddress.address}</p>
              <p>
                {billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}
              </p>
              <p>{billingAddress.country}</p>
              {billingAddress.phone && <p>{billingAddress.phone}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Payment – Card, Affirm, Afterpay, Klarna (Stripe’s Payment Element; billingDetails: 'never' so no duplicate Country) */}
      <div className="relative z-10 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm min-w-0 overflow-visible">
        {paymentMethod === 'afterpay' && afterpayAvailable === false && (
          <div className="m-3 sm:m-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs sm:text-sm font-semibold text-red-900 mb-2">
              ⚠️ Afterpay Not Available
            </p>
            <div className="text-xs text-red-700">
              <p>Afterpay is not currently available. Please ensure:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Afterpay is enabled in your Stripe Dashboard (Settings → Payment methods)</li>
                <li>Order amount meets Afterpay's minimum requirements ($50+)</li>
                <li>Your location supports Afterpay (Canada is supported)</li>
              </ul>
            </div>
          </div>
        )}

        <div className="min-w-0 w-full overflow-x-auto overflow-y-visible min-h-[280px]">
          <div className="stripe-payment-element-wrapper min-w-0 min-h-[260px] px-3 sm:px-4 md:px-5 py-4 sm:py-5 overflow-visible" data-hide-installments="true">
            <PaymentElement
              key={`${clientSecret}-${useAccordionLayout ? 'accordion' : 'tabs'}`}
              options={{
                layout: {
                  type: useAccordionLayout ? 'accordion' : 'tabs',
                  defaultCollapsed: false, // Card expanded by default (most common choice)
                },
                paymentMethodOrder: ['card', 'affirm', 'klarna', 'afterpay_clearpay'],
                fields: {
                  billingDetails: 'never', // We collect billing above; avoids Stripe’s Country dropdown overlapping Affirm/tabs
                },
                wallets: {
                  applePay: paymentMethod === 'card' ? 'auto' : 'never',
                  googlePay: paymentMethod === 'card' ? 'auto' : 'never',
                },
              }}
              onChange={(event) => {
                // Track selected payment method when user changes selection in PaymentElement
                const rawType = event.value?.type;
                const mapToMethod = (t: string): 'card' | 'afterpay' | 'klarna' | 'affirm' => {
                  if (t === 'afterpay_clearpay') return 'afterpay';
                  if (t === 'klarna' || t === 'affirm') return t;
                  return 'card';
                };
                if (event.complete && rawType) {
                  console.log('[PaymentForm] 💳 Payment method selected in PaymentElement:', rawType);
                  setSelectedPaymentMethodType(rawType);
                  onPaymentMethodChange?.(mapToMethod(rawType));
                } else if (rawType) {
                  console.log('[PaymentForm] 🔄 Payment method changing in PaymentElement:', rawType);
                  setSelectedPaymentMethodType(rawType);
                  onPaymentMethodChange?.(mapToMethod(rawType));
                } else {
                  setSelectedPaymentMethodType(null);
                  onPaymentMethodChange?.('card');
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 sm:p-4 rounded-xl border ${
            message.includes('succeeded')
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <p className="text-sm sm:text-base font-semibold">{message}</p>
        </motion.div>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500 sm:text-gray-600">
        <FiLock className="w-4 h-4 text-[#F9629F] flex-shrink-0" />
        <span>Your payment is secure and encrypted</span>
      </div>

      {/* Submit Button – touch-friendly on mobile */}
      <motion.button
        type="submit"
        disabled={!stripe || isProcessing || isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full min-h-[48px] sm:min-h-[56px] py-3.5 sm:py-4 px-4 sm:px-6 text-base sm:text-lg font-bold bg-[#FDE8F0] text-gray-900 border border-gray-300 hover:bg-[#FC9BC2] active:bg-[#FC9BC2] shadow-lg sm:shadow-xl rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
      >
        {isProcessing || isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <FiCreditCard className="w-5 h-5" />
            <span>Pay Now</span>
            <FiArrowRight className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </form>
  );
}
