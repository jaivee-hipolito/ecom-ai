'use client';

import { useState, FormEvent } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser, FiShoppingBag, FiPackage, FiCheck, FiPhone } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { RegisterData } from '@/types/auth';

export default function RegisterForm() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    contactNumber: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      // Registration successful - send verification codes in background
      if (data.requiresVerification) {
        // Send verification codes in background (don't wait for them)
        sendEmailVerificationCode(formData.email).catch(console.error);
        sendPhoneVerificationCode(formData.contactNumber).catch(console.error);
      }
      
      // Automatically sign in the user after successful registration
      setSuccess(true);
      try {
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.error) {
          // If sign-in fails, still redirect but show error
          setError('Account created but sign-in failed. Please log in manually.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          setIsLoading(false);
          return;
        }

        // Update session and redirect to homepage
        await updateSession();
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 500);
      } catch (signInError: any) {
        // If sign-in fails, redirect to login page
        setError('Account created successfully! Please sign in.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const passwordStrength = formData.password.length >= 6 && formData.password === confirmPassword;

  // Send email verification code (background, no UI feedback)
  const sendEmailVerificationCode = async (email: string) => {
    try {
      await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'email' }),
      });
    } catch (err) {
      console.error('Failed to send email verification code:', err);
    }
  };

  // Send phone verification code (background, no UI feedback)
  const sendPhoneVerificationCode = async (phoneNumber: string) => {
    try {
      await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, type: 'phone' }),
      });
    } catch (err) {
      console.error('Failed to send phone verification code:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Logo and Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="text-center mb-8 lg:hidden"
      >
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          className="inline-block mb-4"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#ffa509] to-[#ffb833] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#ffa509]/50">
            <svg className="w-10 h-10 text-[#050b2c]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </motion.div>
        <h2 className="text-4xl font-bold text-white mb-2">
          Join Teezee Today!
        </h2>
        <p className="text-[#ffa509]/80 text-lg">
          Create your account and start shopping
        </p>
      </motion.div>

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10"
      >
        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-white/10"
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#ffa509]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-white">SSL Secured</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#ffa509]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-white">Trusted Store</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#ffa509]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-white">100% Secure</div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Alert variant="error" className="bg-red-500/20 border-red-500/50 text-red-100">
                  {error}
                </Alert>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Alert variant="success" className="bg-green-500/20 border-green-500/50 text-green-100">
                  Registration successful! Redirecting to login...
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* First Name Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FiUser className="w-4 h-4 text-[#ffa509]" />
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-[#ffa509]" />
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Last Name Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
          >
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FiUser className="w-4 h-4 text-[#ffa509]" />
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-[#ffa509]" />
              </div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Contact Number Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FiPhone className="w-4 h-4 text-[#ffa509]" />
              Contact Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiPhone className="h-5 w-5 text-[#ffa509]" />
              </div>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                placeholder="+1 (555) 123-4567"
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
          >
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FiMail className="w-4 h-4 text-[#ffa509]" />
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-[#ffa509]" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FiLock className="w-4 h-4 text-[#ffa509]" />
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-[#ffa509]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimum 6 characters"
                className="w-full pl-12 pr-12 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#ffa509] hover:text-[#ffb833] transition-colors"
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            {formData.password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`flex-1 h-1.5 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-xs ${formData.password.length >= 6 ? 'text-green-400' : 'text-red-400'}`}>
                  {formData.password.length >= 6 ? 'Strong' : 'Weak'}
                </span>
              </div>
            )}
          </motion.div>

          {/* Confirm Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.65 }}
          >
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FiLock className="w-4 h-4 text-[#ffa509]" />
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-[#ffa509]" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className="w-full pl-12 pr-12 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#ffa509] hover:text-[#ffb833] transition-colors"
              >
                {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                {passwordStrength ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <FiCheck className="w-4 h-4" />
                    <span className="text-xs">Passwords match</span>
                  </div>
                ) : (
                  <span className="text-xs text-red-400">Passwords do not match</span>
                )}
              </div>
            )}
          </motion.div>

          {/* Terms and Conditions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-start gap-2"
          >
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-[#ffa509] focus:ring-[#ffa509]"
            />
            <label htmlFor="terms" className="text-sm text-white/70 cursor-pointer">
              I agree to the{' '}
              <Link href="/terms" className="text-[#ffa509] hover:text-[#ffb833] underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#ffa509] hover:text-[#ffb833] underline">
                Privacy Policy
              </Link>
            </label>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              disabled={isLoading || !passwordStrength}
              className="w-full bg-gradient-to-r from-[#ffa509] to-[#ffb833] text-[#050b2c] font-bold py-4 px-6 rounded-xl shadow-lg shadow-[#ffa509]/30 hover:shadow-[#ffa509]/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  <FiShoppingBag className="w-5 h-5" />
                  Create Account & Start Shopping
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Divider */}

        {/* Social Sign Up Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              signIn('google', { 
                callbackUrl: '/dashboard/products',
                redirect: true 
              });
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white hover:bg-white/20 hover:border-[#ffa509]/50 transition-all backdrop-blur-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              router.push('/');
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white hover:bg-white/20 hover:border-[#ffa509]/50 transition-all backdrop-blur-sm"
          >
            <FiPackage className="w-5 h-5" />
            <span className="text-sm font-medium">Guest</span>
          </motion.button>
        </motion.div>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <p className="text-white/70 text-sm">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#ffa509] hover:text-[#ffb833] font-bold transition-colors inline-flex items-center gap-1"
            >
              Sign in
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </motion.div>

        {/* Shopping Benefits - Mobile Only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-8 pt-8 border-t border-white/10 lg:hidden"
        >
          <div className="text-center">
            <div>
              <div className="text-2xl font-bold text-[#ffa509] mb-1">Free</div>
              <div className="text-xs text-white/60">Shipping - Victoria BC area only</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050b2c] to-transparent pointer-events-none"></div>
    </motion.div>
  );
}
