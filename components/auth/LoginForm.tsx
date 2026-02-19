'use client';

import { useState, FormEvent, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShoppingBag, FiPackage, FiAlertCircle, FiClock, FiX } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { LoginCredentials } from '@/types/auth';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update: updateSession } = useSession();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component only processes search params on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check for timeout, browser close, or reset success query parameters
  useEffect(() => {
    // Only process search params on client side to prevent hydration mismatch
    if (!isMounted) return;

    const timeout = searchParams?.get('timeout');
    const closed = searchParams?.get('closed');
    const reset = searchParams?.get('reset');

    console.log('LoginForm - Checking query params:', { timeout, closed, reset });

    if (timeout === 'true') {
      console.log('Setting timeout message');
      setInfoMessage('Your session expired due to inactivity. Please sign in again.');
      // Clear the query parameter after message is displayed
      const timer = setTimeout(() => {
        router.replace('/login', { scroll: false });
      }, 10000); // Keep message visible for 10 seconds
      return () => clearTimeout(timer);
    } else if (closed === 'true') {
      console.log('Setting browser close message');
      setInfoMessage('You were logged out because the browser was closed. Please sign in again.');
      // Clear the query parameter after message is displayed
      const timer = setTimeout(() => {
        router.replace('/login', { scroll: false });
      }, 10000); // Keep message visible for 10 seconds
      return () => clearTimeout(timer);
    } else if (reset === 'success') {
      console.log('Setting reset success message');
      setInfoMessage('Password reset successful! Please sign in with your new password.');
      // Clear the query parameter after message is displayed
      const timer = setTimeout(() => {
        router.replace('/login', { scroll: false });
      }, 10000); // Keep message visible for 10 seconds
      return () => clearTimeout(timer);
    }
  }, [searchParams, router, isMounted]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Map NextAuth error codes to user-friendly messages
        let errorMessage = result.error;
        
        // Handle NextAuth error codes
        if (result.error === 'Configuration' || result.error === 'CredentialsSignin') {
          errorMessage = 'Incorrect email or password';
        } else if (result.error === 'AccessDenied') {
          errorMessage = 'Access denied. Please contact support.';
        } else if (result.error === 'Verification') {
          errorMessage = 'Verification failed. Please try again.';
        } else if (result.error.toLowerCase().includes('invalid') || result.error.toLowerCase().includes('incorrect')) {
          errorMessage = 'Incorrect email or password';
        }
        
        setError(errorMessage);
        setIsLoading(false);
      } else {
        // Update session first
        await updateSession();
        
        // Wait a moment for session to update, then fetch user role and redirect
        setTimeout(async () => {
          try {
            // Fetch user profile to get role
            const response = await fetch('/api/users/profile');
            if (response.ok) {
              const data = await response.json();
              if (data?.user?.role === 'admin') {
                router.push('/admin/dashboard');
              } else {
                router.push('/dashboard/products');
              }
            } else {
              // Fallback to regular dashboard if API call fails
              router.push('/dashboard/products');
            }
            router.refresh();
          } catch (err) {
            // Fallback to regular dashboard on error
            router.push('/dashboard/products');
            router.refresh();
          }
        }, 300);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
      suppressHydrationWarning
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
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#F9629F] to-[#FC9BC2] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#F9629F]/50">
            <svg className="w-10 h-10 text-[#000000]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </motion.div>
        <h2 className="text-4xl font-bold text-white mb-2">
          Welcome Back!
        </h2>
        <p className="text-[#F9629F]/80 text-lg">
          Sign in to continue shopping
        </p>
      </motion.div>

      {/* Login Card */}
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
              <svg className="w-8 h-8 text-[#F9629F]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-white">SSL Secured</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#F9629F]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-white">Trusted Store</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-[#F9629F]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-white">100% Secure</div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
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
            {infoMessage && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full"
              >
                <div className="bg-[#F9629F]/20 backdrop-blur-sm border-2 border-[#F9629F]/50 rounded-xl p-4 text-white flex items-start gap-3 shadow-lg shadow-[#F9629F]/20 relative">
                  <FiAlertCircle className="w-5 h-5 text-[#F9629F] flex-shrink-0 mt-0.5" />
                  <span className="font-medium flex-1">{infoMessage}</span>
                  <button
                    onClick={() => setInfoMessage('')}
                    className="text-white/70 hover:text-white transition-colors flex-shrink-0"
                    aria-label="Close message"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FiMail className="w-4 h-4 text-[#F9629F]" />
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-[#F9629F]" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all backdrop-blur-sm"
                suppressHydrationWarning
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <FiLock className="w-4 h-4 text-[#F9629F]" />
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-[#F9629F]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all backdrop-blur-sm"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#F9629F] hover:text-[#FC9BC2] transition-colors"
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
          </motion.div>

          {/* Forgot Password */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#F9629F] focus:ring-[#F9629F]"
                suppressHydrationWarning
              />
              <label htmlFor="remember" className="text-sm text-white/70 cursor-pointer">
                Remember me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-[#F9629F] hover:text-[#FC9BC2] font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-[#FC9BC2] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Signing in...
                </>
              ) : (
                <>
                  <FiShoppingBag className="w-5 h-5" />
                  Sign In & Start Shopping
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        </form>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative my-8"
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/10 backdrop-blur-sm text-white/70 rounded-full">
              Or continue with
            </span>
          </div>
        </motion.div>

        {/* Social Login Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
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
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white hover:bg-white/20 hover:border-[#F9629F]/50 transition-all backdrop-blur-sm"
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
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white hover:bg-white/20 hover:border-[#F9629F]/50 transition-all backdrop-blur-sm"
          >
            <FiPackage className="w-5 h-5" />
            <span className="text-sm font-medium">Guest</span>
          </motion.button>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-white/70 text-sm">
            New to Teezee?{' '}
            <Link
              href="/register"
              className="text-[#F9629F] hover:text-[#FC9BC2] font-bold transition-colors inline-flex items-center gap-1"
            >
              Create an account
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </motion.div>

        {/* Shopping Benefits - Mobile Only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 pt-8 border-t border-white/10 lg:hidden"
        >
          <div className="text-center">
            <div>
              <div className="text-2xl font-bold text-[#F9629F] mb-1">Free</div>
              <div className="text-xs text-white/60">Shipping - Victoria BC area only</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#000000] to-transparent pointer-events-none"></div>
    </motion.div>
  );
}
