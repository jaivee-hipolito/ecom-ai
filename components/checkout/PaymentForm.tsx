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

interface BillingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
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
  } | null;
  paymentMethod?: 'card' | 'afterpay' | 'klarna' | 'affirm';
  total?: number; // Total amount including BNPL fee
  onRecreateIntent?: (newClientSecret: string) => void; // Callback to recreate payment intent with BNPL fee
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
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [afterpayAvailable, setAfterpayAvailable] = useState<boolean | null>(null);
  const [selectedPaymentMethodType, setSelectedPaymentMethodType] = useState<string | null>(null); // Track selected payment method from PaymentElement

  // Hide Stripe's default installment text and show our own with 6% fee
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

      // Hide elements containing installment amounts
      const hideElements = () => {
        // Get all text-containing elements, but exclude form inputs and buttons
        const allElements = paymentElement!.querySelectorAll('p, span, div, label, a');
        allElements.forEach((el) => {
          // Skip if it's an input, button, form element, or tab button
          if (el.closest('input, button:not([class*="Tab"]), form') || el.tagName === 'BUTTON') {
            // But allow tab buttons through
            if (!el.closest('[role="tablist"]')) {
              return;
            }
          }

          const text = (el.textContent || '').trim();
          const html = (el.innerHTML || '').trim();
          
          // Hide if it contains installment-related text or currency amounts
          // Match patterns like "CA$187.46", "Pay in 4 interest-free payments of CA$187.46", etc.
          const shouldHide = 
            text.includes('CA$187.46') ||
            text.includes('CA$187') || 
            (text.includes('CA$') && (text.includes('Pay in 4') || text.includes('payments of') || text.includes('interest-free'))) ||
            (text.includes('Pay in 4') && (text.includes('interest-free') || text.includes('CA$'))) ||
            text.includes('6–12 months') ||
            (text.includes('payments of') && text.includes('CA$')) ||
            (text.includes('Learn more') && el.closest('[class*="PaymentMethod"]')) ||
            html.includes('CA$187.46') ||
            html.includes('CA$187') ||
            (html.includes('CA$') && html.includes('Pay in 4')) ||
            text.match(/CA\$\d+\.\d+/); // Match any CA$ amount like CA$187.46
          
          if (shouldHide) {
            const htmlEl = el as HTMLElement;
            htmlEl.style.display = 'none';
            htmlEl.style.visibility = 'hidden';
            htmlEl.style.opacity = '0';
            htmlEl.style.height = '0';
            htmlEl.style.overflow = 'hidden';
            htmlEl.style.margin = '0';
            htmlEl.style.padding = '0';
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
            console.log('Payment Intent retrieved:', {
              id: paymentIntent.paymentIntent.id,
              payment_method_types: paymentIntent.paymentIntent.payment_method_types,
              status: paymentIntent.paymentIntent.status,
            });

            const hasAfterpay = paymentIntent.paymentIntent.payment_method_types?.includes('afterpay_clearpay');
            const hasCard = paymentIntent.paymentIntent.payment_method_types?.includes('card');
            
            setAfterpayAvailable(hasAfterpay && !hasCard);
            
            if (!hasAfterpay || hasCard) {
              console.warn('Afterpay not properly configured in payment intent:', {
                hasAfterpay,
                hasCard,
                payment_method_types: paymentIntent.paymentIntent.payment_method_types,
              });
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
  });

  // Update billing address when shipping address changes or when checkbox is toggled
  useEffect(() => {
    if (useShippingAsBilling && shippingAddress) {
      setBillingAddress({
        fullName: shippingAddress.fullName,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
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

      // Check payment intent to detect payment method BEFORE confirming
      const paymentIntentBeforeConfirm = await stripe.retrievePaymentIntent(clientSecret);
      const paymentIntentData = paymentIntentBeforeConfirm.paymentIntent;
      const paymentMethodTypes = paymentIntentData?.payment_method_types || [];
      const paymentMethodFromMetadata = (paymentIntentData as any)?.metadata?.paymentMethod || paymentMethod;
      
      // Check if BNPL methods are explicitly configured in payment intent types
      const hasAffirm = paymentMethodTypes.includes('affirm');
      const hasKlarna = paymentMethodTypes.includes('klarna');
      const hasAfterpay = paymentMethodTypes.includes('afterpay_clearpay') || paymentMethodTypes.includes('afterpay');
      const hasCard = paymentMethodTypes.includes('card');
      
      // Check if payment method is already attached to payment intent (indicates what user selected)
      const attachedPaymentMethod = paymentIntentData?.payment_method;
      let attachedPaymentMethodType = null;
      if (attachedPaymentMethod && typeof attachedPaymentMethod === 'object') {
        attachedPaymentMethodType = attachedPaymentMethod.type;
      } else if (attachedPaymentMethod) {
        // If it's a string ID, we can't retrieve it client-side, use metadata instead
        // Payment method type should be in metadata
        attachedPaymentMethodType = (paymentIntentData as any)?.metadata?.selectedPaymentMethodType;
      }
      
      // Get selected payment method from PaymentElement onChange tracking (most reliable)
      // This is set when user selects a payment method in the PaymentElement UI
      const selectedPaymentMethodFromElement = selectedPaymentMethodType;
      
      // Also try to get it directly from PaymentElement as fallback
      let selectedPaymentMethodFromElementDirect = null;
      try {
        const paymentElement = elements.getElement('payment');
        if (paymentElement) {
          // Try to get the value from PaymentElement
          const elementValue = (paymentElement as any).getValue?.();
          if (elementValue?.type) {
            selectedPaymentMethodFromElementDirect = elementValue.type;
          }
        }
      } catch (err) {
        // PaymentElement might not expose this, that's okay - we use onChange tracking
      }
      
      // Use onChange tracking first, fallback to direct access
      const finalSelectedPaymentMethod = selectedPaymentMethodFromElement || selectedPaymentMethodFromElementDirect;
      
      // STEP 1: Check if payment method prop is explicitly BNPL (afterpay, klarna, affirm)
      // If yes, this is definitely BNPL - keep the 6% fee
      const isExplicitBNPLProp = paymentMethod === 'afterpay' || paymentMethod === 'klarna' || paymentMethod === 'affirm';
      
      // STEP 2: Check if payment intent metadata indicates BNPL
      const isBNPLFromMetadata = paymentMethodFromMetadata === 'afterpay' || paymentMethodFromMetadata === 'klarna' || paymentMethodFromMetadata === 'affirm';
      
      // STEP 3: Check if attached payment method type is BNPL
      const isBNPLFromAttachedMethod = attachedPaymentMethodType === 'affirm' || attachedPaymentMethodType === 'klarna' || attachedPaymentMethodType === 'afterpay_clearpay';
      
      // STEP 4: Check if PaymentElement indicates BNPL selection (from onChange tracking)
      const isBNPLFromElement = finalSelectedPaymentMethod === 'affirm' || 
                                finalSelectedPaymentMethod === 'klarna' || 
                                finalSelectedPaymentMethod === 'afterpay_clearpay';
      
      // Check if payment intent uses automatic_payment_methods (which includes BNPL options like Affirm/Klarna)
      const usesAutomaticPaymentMethods = !paymentIntentData?.payment_method_types || 
                                        paymentIntentData.payment_method_types.length === 0 ||
                                        (paymentIntentData as any).automatic_payment_methods?.enabled === true;
      
      // IMPORTANT: When automatic_payment_methods is enabled, ALL payment methods appear in payment_method_types
      // So we can't rely on checking if BNPL methods are in the array - they will always be there
      // Instead, we need to check what the user ACTUALLY selected:
      // 1. Check if payment method is attached (user already selected)
      // 2. Check PaymentElement value (what user selected in UI)
      // 3. Check metadata (explicit selection)
      // 4. Check payment method prop (what was passed to component)
      // 5. If none of the above indicate BNPL, and prop is 'card', assume card payment
      
      // Determine if this is a BNPL payment based on ACTUAL selection, not just availability
      // BNPL if: explicit prop, metadata indicates BNPL, attached method is BNPL, OR PaymentElement shows BNPL
      const isBNPLPayment = isExplicitBNPLProp || isBNPLFromMetadata || isBNPLFromAttachedMethod || isBNPLFromElement;
      
      // Determine if this is a card payment
      // LOGIC:
      // 1. Payment method prop must be 'card' (not explicitly BNPL)
      // 2. No BNPL detected from any source (metadata, attached method, PaymentElement)
      // 3. If BNPL is NOT detected and prop is 'card', assume it's card payment and remove fee
      // 4. This ensures:
      //    - Card payments: Remove 6% fee (no BNPL detected) ✓
      //    - BNPL payments: Keep 6% fee (BNPL detected from attached method or PaymentElement) ✓
      //
      // IMPORTANT: When automatic_payment_methods is enabled:
      // - If attachedPaymentMethodType is BNPL → Keep fee (user selected BNPL)
      // - If attachedPaymentMethodType is 'card' → Remove fee (user selected card)
      // - If attachedPaymentMethodType is null/undefined → Check PaymentElement or assume card if prop is 'card'
      const isCardPayment = paymentMethod === 'card' && 
                           !isExplicitBNPLProp &&
                           !isBNPLFromMetadata &&
                           !isBNPLFromAttachedMethod &&
                           !isBNPLFromElement;
      
      // Summary of detection:
      // - isBNPLPayment = true if ANY BNPL source detected → Keep fee
      // - isCardPayment = true if prop is 'card' AND NO BNPL detected → Remove fee
      
      // LOGIC: 
      // - If BNPL payment (explicit or detected) → Keep 6% fee (don't update)
      // - If card payment (no BNPL detected) → Remove 6% fee (update payment intent)
      // - If automatic methods enabled but no explicit BNPL → Treat as card (remove fee, check after confirmation)
      
      // Log detection results for debugging
      console.log('========================================');
      console.log('[PaymentForm] 🔍 PAYMENT METHOD DETECTION BEFORE CONFIRMATION');
      console.log('========================================');
      console.log('Detection Results:', {
        paymentMethodProp: paymentMethod,
        paymentMethodFromMetadata: paymentMethodFromMetadata,
        paymentMethodTypes: paymentMethodTypes,
        usesAutomaticPaymentMethods,
        hasCard,
        hasAffirm,
        hasKlarna,
        hasAfterpay,
        attachedPaymentMethodType,
        selectedPaymentMethodFromState: selectedPaymentMethodType,
        selectedPaymentMethodFromElementDirect: selectedPaymentMethodFromElementDirect,
        finalSelectedPaymentMethod: finalSelectedPaymentMethod,
        isExplicitBNPLProp,
        isBNPLFromMetadata,
        isBNPLFromAttachedMethod,
        isBNPLFromElement,
        isBNPLPayment,
        isCardPayment,
        note: usesAutomaticPaymentMethods 
          ? 'Automatic payment methods enabled - Using PaymentElement onChange tracking to detect actual selection'
          : 'Explicit payment methods - checking types array',
        decision: isCardPayment ? 'CARD PAYMENT - Will remove 6% fee' : (isBNPLPayment ? 'BNPL PAYMENT - Will keep 6% fee' : 'UNKNOWN - Will keep 6% fee'),
        paymentIntentId: paymentIntentData?.id || '',
        currentAmountInCents: paymentIntentData?.amount || 0,
        currentAmountInDollars: ((paymentIntentData?.amount || 0) / 100).toFixed(2),
        timestamp: new Date().toISOString(),
      });
      console.log('========================================\n');
      
      // If card payment is detected, update payment intent to remove BNPL fee (6%)
      if (isCardPayment) {
        console.log('========================================');
        console.log('[PaymentForm] 🔍 CHECKING PAYMENT METHOD');
        console.log('========================================');
        console.log('Payment Method Detection - CARD PAYMENT DETECTED:', {
          paymentMethodProp: paymentMethod,
          paymentMethodFromMetadata: paymentMethodFromMetadata,
          paymentMethodTypes: paymentMethodTypes,
          hasCard,
          hasAffirm,
          hasKlarna,
          hasAfterpay,
          usesAutomaticPaymentMethods,
          attachedPaymentMethod: attachedPaymentMethod ? (typeof attachedPaymentMethod === 'object' ? attachedPaymentMethod.type : 'ID: ' + attachedPaymentMethod) : 'none',
          attachedPaymentMethodType,
          selectedPaymentMethodFromState: selectedPaymentMethodType,
          finalSelectedPaymentMethod: finalSelectedPaymentMethod,
          isExplicitBNPLProp,
          isBNPLFromMetadata,
          isBNPLFromAttachedMethod,
          isBNPLFromElement,
          isBNPLPayment,
          isCardPayment,
          detectionSummary: {
            'Prop is card': paymentMethod === 'card',
            'Not explicit BNPL': !isExplicitBNPLProp,
            'Not BNPL from metadata': !isBNPLFromMetadata,
            'Not BNPL from attached': !isBNPLFromAttachedMethod,
            'Not BNPL from element': !isBNPLFromElement,
            'Final: isCardPayment': isCardPayment,
          },
          note: usesAutomaticPaymentMethods 
            ? 'Automatic payment methods enabled - BNPL methods in array are available options, but user selected card (no BNPL detected)'
            : 'Explicit payment methods - card payment confirmed',
          decision: 'Removing 6% BNPL fee for card payment',
          paymentIntentId: paymentIntentData?.id || '',
          currentAmountInCents: paymentIntentData?.amount || 0,
          currentAmountInDollars: ((paymentIntentData?.amount || 0) / 100).toFixed(2),
          timestamp: new Date().toISOString(),
        });
        
        // Calculate correct amount without BNPL fee
        // Payment intent amount includes BNPL fee (6%), so we need to remove it
        // Formula: subtotal = total_with_fee / 1.06
        const BNPL_FEE_RATE = 0.06; // 6%
        const currentAmountInDollars = (paymentIntentData?.amount || 0) / 100;
        const amountWithoutBNPLFee = currentAmountInDollars / (1 + BNPL_FEE_RATE);
        const correctAmountInCents = Math.round(amountWithoutBNPLFee * 100);
        
        console.log('[PaymentForm] 💳 CARD PAYMENT DETECTED - UPDATING PAYMENT INTENT');
        console.log('Amount Calculation:', {
          currentAmountInDollars: currentAmountInDollars.toFixed(2),
          bnplFeeIncluded: (currentAmountInDollars * BNPL_FEE_RATE / (1 + BNPL_FEE_RATE)).toFixed(2),
          correctAmountInDollars: amountWithoutBNPLFee.toFixed(2),
          correctAmountInCents,
          timestamp: new Date().toISOString(),
        });
        
        // Update payment intent amount via API
        try {
          const updateResponse = await fetch('/api/payments/update-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntentData?.id || '',
              amount: correctAmountInCents, // Amount in cents
            }),
          });
          
          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('[PaymentForm] ❌ Failed to update payment intent:', errorData);
            throw new Error(errorData.error || 'Failed to update payment intent amount');
          }
          
          const updateData = await updateResponse.json();
          console.log('[PaymentForm] ✅ PAYMENT INTENT UPDATED SUCCESSFULLY');
          console.log('Updated Payment Intent:', {
            id: updateData.paymentIntent.id,
            newAmountInCents: updateData.paymentIntent.amount,
            newAmountInDollars: (updateData.paymentIntent.amount / 100).toFixed(2),
            status: updateData.paymentIntent.status,
            timestamp: new Date().toISOString(),
          });
          console.log('========================================\n');
          
          // Update clientSecret with the updated payment intent's client secret
          // Note: The client secret might be the same, but we should use the updated one if provided
          if (updateData.paymentIntent.client_secret) {
            // Note: We can't update the clientSecret prop here, but the payment intent ID is the same
            // The updated amount will be used when confirming
          }
        } catch (updateError: any) {
          console.error('[PaymentForm] ❌ Error updating payment intent:', updateError);
          // Don't fail the payment - log error but continue
          // The order creation APIs will handle the fee adjustment
          console.warn('[PaymentForm] ⚠️ Continuing with payment despite update error - order APIs will handle fee adjustment');
        }
      } else {
        // BNPL payment detected OR card payment not detected - keep the 6% fee (don't update payment intent)
        console.log('========================================');
        console.log('[PaymentForm] 🔍 PAYMENT METHOD CHECK');
        console.log('========================================');
        console.log('NOT Removing Fee - Analysis:', {
          paymentMethodProp: paymentMethod,
          paymentMethodFromMetadata: paymentMethodFromMetadata,
          paymentMethodTypes: paymentMethodTypes,
          usesAutomaticPaymentMethods,
          hasAffirm,
          hasKlarna,
          hasAfterpay,
          attachedPaymentMethodType,
          selectedPaymentMethodFromState: selectedPaymentMethodType,
          selectedPaymentMethodFromElementDirect: selectedPaymentMethodFromElementDirect,
          finalSelectedPaymentMethod: finalSelectedPaymentMethod,
          isExplicitBNPLProp,
          isBNPLFromMetadata,
          isBNPLFromAttachedMethod,
          isBNPLFromElement,
          isBNPLPayment,
          isCardPayment,
          reason: !isCardPayment 
            ? (isBNPLPayment 
                ? 'BNPL payment detected - keeping 6% fee' 
                : usesAutomaticPaymentMethods
                  ? 'Automatic payment methods enabled - no BNPL selection detected in PaymentElement, keeping fee for safety'
                  : 'Card payment not detected - keeping fee as safety measure')
            : 'Unknown reason',
          note: usesAutomaticPaymentMethods 
            ? `PaymentElement onChange tracking: ${selectedPaymentMethodType || 'none'}. Using this to detect user selection.`
            : 'Checking payment method types array',
          decision: 'Keeping 6% BNPL fee - no amount adjustment',
          paymentIntentId: paymentIntentData?.id || '',
          amountInCents: paymentIntentData?.amount || 0,
          amountInDollars: ((paymentIntentData?.amount || 0) / 100).toFixed(2),
          timestamp: new Date().toISOString(),
        });
        console.log('========================================\n');
      }
      
      // Then, confirm the payment with billing address (required by Stripe)
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
      const usedCard = actualPaymentMethodType === 'card' || actualPaymentMethod === 'card';
      
      // If card was used but payment intent had BNPL fee, we need to handle it
      // Note: This happens when automatic_payment_methods is enabled and we couldn't detect selection before confirmation
      if (usedCard && usesAutomaticPaymentMethods && paymentIntent) {
        console.log('[PaymentForm] 💳 CARD PAYMENT CONFIRMED - Checking if fee needs refund');
        console.log('Post-Confirmation Analysis:', {
          actualPaymentMethodType,
          actualPaymentMethod,
          paymentIntentAmount: paymentIntent.amount,
          paymentIntentAmountInDollars: (paymentIntent.amount / 100).toFixed(2),
          note: 'Card payment confirmed - if fee was included, order APIs will handle refund',
        });
      }
      
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
        // Handle 3D Secure or BNPL redirects (Afterpay)
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
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Billing Address Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-[#000000] flex items-center gap-2">
            <FiMapPin className="w-5 h-5 text-[#F9629F]" />
            Billing Address
          </h3>
        </div>

        {/* Use Shipping Address Checkbox */}
        {shippingAddress && (
          <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={useShippingAsBilling}
              onChange={(e) => handleUseShippingToggle(e.target.checked)}
              className="w-4 h-4 text-[#F9629F] border-gray-300 rounded focus:ring-[#F9629F] focus:ring-2"
            />
            <span className="text-sm text-gray-700">Use shipping address as billing address</span>
          </label>
        )}

        {/* Billing Address Form */}
        {!useShippingAsBilling && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200"
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
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-700 space-y-1">
              <p className="font-semibold">{billingAddress.fullName}</p>
              <p>{billingAddress.address}</p>
              <p>
                {billingAddress.city}, {billingAddress.state} {billingAddress.zipCode}
              </p>
              <p>{billingAddress.country}</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Element */}
      <div className="bg-gray-50 p-2 sm:p-4 md:p-6 rounded-xl border-2 border-gray-200 overflow-visible" style={{ minWidth: 0 }}>
        {paymentMethod === 'afterpay' && (
          <div className="mb-4 p-4 bg-[#b2fce4] border-2 border-[#7ee8c0] rounded-lg shadow-md">
            <p className="text-base font-bold text-gray-900 mb-3">
              💳 Pay with Afterpay
            </p>
            {/* Installment amounts - total already includes 6% fee */}
            {total > 0 && (
              <div className="mb-3 p-3 bg-white rounded-lg border border-[#7ee8c0]">
                <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">4 interest-free payments of:</p>
                <p className="text-2xl font-black text-[#000000] mb-1">
                  {formatCurrency(total / 4)}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-semibold">(includes 6% BNPL fee)</span>
                </p>
                <p className="text-sm text-gray-700 font-semibold border-t border-gray-200 pt-2 mt-2">
                  Total: <span className="text-[#000000]">{formatCurrency(total)}</span>
                </p>
              </div>
            )}
            <p className="text-xs text-gray-700">
              Select Afterpay below to complete your payment. You'll be redirected to Afterpay to finish checkout.
            </p>
          </div>
        )}
        
        {paymentMethod === 'klarna' && (
          <div className="mb-4 p-4 bg-white border-2 border-[#ffb3c7] rounded-lg shadow-md">
            <p className="text-base font-bold text-gray-900 mb-3">
              💳 Pay with Klarna
            </p>
            {/* Installment amounts - total already includes 6% fee */}
            {total > 0 && (
              <div className="mb-3 p-3 bg-white rounded-lg border border-[#ffb3c7]">
                <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">4 interest-free payments of:</p>
                <p className="text-2xl font-black text-[#000000] mb-1">
                  {formatCurrency(total / 4)}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-semibold">(includes 6% BNPL fee)</span>
                </p>
                <p className="text-sm text-gray-700 font-semibold border-t border-gray-200 pt-2 mt-2">
                  Total: <span className="text-[#000000]">{formatCurrency(total)}</span>
                </p>
              </div>
            )}
            <p className="text-xs text-gray-700">
              Select Klarna below to complete your payment. You'll be redirected to Klarna to finish checkout.
            </p>
          </div>
        )}
        
        {paymentMethod === 'afterpay' && afterpayAvailable === false && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-900 mb-2">
              ⚠️ Afterpay Not Available
            </p>
            <p className="text-xs text-red-700">
              Afterpay is not currently available. Please ensure:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Afterpay is enabled in your Stripe Dashboard (Settings → Payment methods)</li>
                <li>Order amount meets Afterpay's minimum requirements ($50+)</li>
                <li>Your location supports Afterpay (Canada is supported)</li>
              </ul>
            </p>
          </div>
        )}
        
        <div className="overflow-visible min-w-0 w-full -mx-2 sm:mx-0 px-2 sm:px-0" style={{ maxWidth: '100%' }}>
          <div className="stripe-payment-element-wrapper" data-hide-installments="true">
            <PaymentElement
              key={`payment-${paymentMethod}-${clientSecret}`} // Force complete re-mount when payment method changes
              options={{
                layout: paymentMethod === 'afterpay' ? 'accordion' : 'tabs', // Use accordion for Afterpay
                fields: {
                  billingDetails: 'auto', // Automatically collect billing details including address
                },
                defaultValues: {
                  billingDetails: {
                    name: billingAddress.fullName,
                    address: {
                      line1: billingAddress.address,
                      city: billingAddress.city,
                      state: billingAddress.state,
                      postal_code: billingAddress.zipCode,
                      country: billingAddress.country,
                    },
                  },
                },
                wallets: {
                  applePay: paymentMethod === 'card' ? 'auto' : 'never',
                  googlePay: paymentMethod === 'card' ? 'auto' : 'never',
                },
              }}
              onChange={(event) => {
                // Track selected payment method when user changes selection in PaymentElement
                if (event.complete && event.value?.type) {
                  const selectedType = event.value.type;
                  console.log('[PaymentForm] 💳 Payment method selected in PaymentElement:', selectedType);
                  setSelectedPaymentMethodType(selectedType);
                } else if (event.value?.type) {
                  // Also track even if not complete (user is selecting)
                  const selectedType = event.value.type;
                  console.log('[PaymentForm] 🔄 Payment method changing in PaymentElement:', selectedType);
                  setSelectedPaymentMethodType(selectedType);
                } else {
                  // Reset if no type is selected
                  setSelectedPaymentMethodType(null);
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
          className={`p-4 rounded-xl border-2 ${
            message.includes('succeeded')
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <p className="font-semibold">{message}</p>
        </motion.div>
      )}

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        <FiLock className="w-4 h-4 text-[#F9629F]" />
        <span>Your payment is secure and encrypted</span>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!stripe || isProcessing || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 hover:bg-[#FC9BC2] shadow-xl hover:shadow-2xl py-4 px-6 text-lg font-bold transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
