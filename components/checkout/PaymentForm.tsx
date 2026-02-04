'use client';

import { useState, FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { FiLock, FiCreditCard, FiArrowRight } from 'react-icons/fi';

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export default function PaymentForm({
  clientSecret,
  onSuccess,
  onError,
  isLoading = false,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      // First, submit the elements to validate the form
      const { error: submitError } = await elements.submit();
      
      if (submitError) {
        setMessage(submitError.message || 'Form validation failed');
        onError(submitError.message || 'Form validation failed');
        setIsProcessing(false);
        return;
      }

      // Then, confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'An error occurred');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded!');
        onSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Handle 3D Secure or other actions
        // Stripe will handle the redirect if needed
        setMessage('Payment requires additional authentication');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
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
        <FiLock className="w-4 h-4 text-[#ffa509]" />
        <span>Your payment is secure and encrypted</span>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!stripe || isProcessing || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-[#ffa509] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffa509] text-white border-none shadow-xl hover:shadow-2xl py-4 px-6 text-lg font-bold transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
