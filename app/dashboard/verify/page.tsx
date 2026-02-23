'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiPhone, FiCheckCircle, FiRefreshCw, FiAlertCircle, FiShield } from 'react-icons/fi';
import Loading from '@/components/ui/Loading';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

// Normalize phone number (remove all non-digit characters except +)
function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  const normalized = phoneNumber.replace(/[^\d+]/g, '');
  return normalized.startsWith('+') ? normalized : normalized;
}

export default function VerifyPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [sendingEmailCode, setSendingEmailCode] = useState(false);
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [emailCooldownRemaining, setEmailCooldownRemaining] = useState(0);
  const [phoneCooldownRemaining, setPhoneCooldownRemaining] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await fetch('/api/users/profile', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
          setEmailVerified(!!data.user?.emailVerified);
          setPhoneVerified(!!data.user?.phoneVerified);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  // Cooldown countdown (5 min after each send)
  useEffect(() => {
    if (emailCooldownRemaining <= 0 && phoneCooldownRemaining <= 0) return;
    const t = setInterval(() => {
      setEmailCooldownRemaining((s) => (s > 0 ? s - 1 : 0));
      setPhoneCooldownRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [emailCooldownRemaining, phoneCooldownRemaining]);

  const formatCooldown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Send email verification code
  const sendEmailVerificationCode = async () => {
    if (!userProfile?.email) return;
    setSendingEmailCode(true);
    setError('');
    setSuccess('');
    setEmailCode(''); // Clear the input field when resending
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userProfile.email, type: 'email' }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Verification code sent to your email!');
        setTimeout(() => setSuccess(''), 15000);
        setEmailCooldownRemaining(typeof data.cooldownSeconds === 'number' ? data.cooldownSeconds : 300);
      } else {
        setError(data.error || 'Failed to send verification code');
        if (response.status === 429 && data.cooldownSeconds) {
          setEmailCooldownRemaining(data.cooldownSeconds);
        }
      }
    } catch (err: any) {
      setError('Failed to send verification code');
    } finally {
      setSendingEmailCode(false);
    }
  };

  // Send phone verification code
  const sendPhoneVerificationCode = async () => {
    if (!userProfile?.contactNumber) return;
    setSendingPhoneCode(true);
    setError('');
    setSuccess('');
    setPhoneCode(''); // Clear the input field when resending
    try {
      // Normalize phone number before sending
      const normalizedPhone = normalizePhoneNumber(userProfile.contactNumber);
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: normalizedPhone, type: 'phone' }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Verification code sent to your phone!');
        setTimeout(() => setSuccess(''), 15000);
        setPhoneCooldownRemaining(typeof data.cooldownSeconds === 'number' ? data.cooldownSeconds : 300);
      } else {
        setError(data.error || 'Failed to send verification code');
        if (response.status === 429 && data.cooldownSeconds) {
          setPhoneCooldownRemaining(data.cooldownSeconds);
        }
      }
    } catch (err: any) {
      setError('Failed to send verification code');
    } finally {
      setSendingPhoneCode(false);
    }
  };

  // Verify email code
  const verifyEmailCode = async () => {
    if (!emailCode || emailCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setVerifyingEmail(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userProfile?.email, code: emailCode, type: 'email' }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEmailCode('');
        setSuccess('Email verified successfully!');
        setTimeout(() => setSuccess(''), 5000);
        // Refetch profile from server so verified state persists on refresh/navigation
        const profileResponse = await fetch('/api/users/profile', { cache: 'no-store' });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData.user);
          setEmailVerified(!!profileData.user?.emailVerified);
        } else {
          setEmailVerified(true);
        }
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err: any) {
      setError('Failed to verify code');
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Verify phone code
  const verifyPhoneCode = async () => {
    if (!phoneCode || phoneCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setVerifyingPhone(true);
    setError('');
    setSuccess('');
    try {
      // Normalize phone number before sending
      const normalizedPhone = userProfile?.contactNumber ? normalizePhoneNumber(userProfile.contactNumber) : '';
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: normalizedPhone, code: phoneCode, type: 'phone' }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPhoneCode('');
        setSuccess('Phone number verified successfully!');
        setTimeout(() => setSuccess(''), 5000);
        // Refetch profile from server so verified state persists on refresh
        const profileResponse = await fetch('/api/users/profile', { cache: 'no-store' });
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserProfile(profileData.user);
          setPhoneVerified(!!profileData.user?.phoneVerified);
        } else {
          setPhoneVerified(true);
        }
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err: any) {
      setError('Failed to verify code');
    } finally {
      setVerifyingPhone(false);
    }
  };

  if (authLoading || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-3 py-4 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        {/* Header - compact on mobile */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 lg:mb-12"
        >
          <div className="flex items-center justify-center mb-3 sm:mb-5 lg:mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-[#F9629F] to-[#F9629F] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl sm:shadow-2xl shadow-[#F9629F]/50">
              <FiShield className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-[#000000]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#000000] mb-2 sm:mb-4">
            Verify Your Account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-1 mb-4">
            Verify your email and phone number to secure your account
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400/60 rounded-xl"
          >
            <span className="text-emerald-700 font-bold text-sm sm:text-base">
              Get $5 off your first order! Verify both your phone and email for a one-time discount at checkout.
            </span>
          </motion.div>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 sm:mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800 flex items-center gap-3 text-sm sm:text-base"
            >
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <span className="text-red-600 hover:text-red-800">×</span>
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-3 sm:mb-6 p-3 sm:p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-800 flex items-center gap-3 text-sm sm:text-base"
            >
              <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <span className="text-green-600 hover:text-green-800">×</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Email Verification Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-gray-100"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  emailVerified ? 'bg-green-500' : 'bg-[#F9629F]'
                }`}>
                  {emailVerified ? (
                    <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-[#000000]">Email Verification</h2>
                  <p className="text-sm text-gray-600">{userProfile?.email}</p>
                </div>
              </div>
              {emailVerified && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Verified
                </span>
              )}
            </div>

            {!emailVerified ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  We'll send a verification code to your email address. Enter the code below to verify.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all text-center text-2xl tracking-widest font-bold text-[#000000]"
                  />
                </div>
                <div className="flex gap-3">
                  <motion.button
                    onClick={verifyEmailCode}
                    disabled={emailCode.length !== 6 || verifyingEmail}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-[#F9629F] to-[#F9629F] text-[#000000] font-bold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {verifyingEmail ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="w-5 h-5" />
                        Verify Email
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={sendEmailVerificationCode}
                    disabled={sendingEmailCode || emailCooldownRemaining > 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3 bg-gray-100 border-2 border-gray-200 text-[#000000] rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[7rem] justify-center"
                    title={emailCooldownRemaining > 0 ? `Resend in ${formatCooldown(emailCooldownRemaining)}` : 'Resend code'}
                  >
                    <FiRefreshCw className={`w-5 h-5 shrink-0 ${sendingEmailCode ? 'animate-spin' : ''}`} />
                    {emailCooldownRemaining > 0 ? (
                      <span className="text-sm">{formatCooldown(emailCooldownRemaining)}</span>
                    ) : null}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-green-600 font-semibold">✓ Email verified successfully!</p>
              </div>
            )}
          </motion.div>

          {/* Phone Verification Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  phoneVerified ? 'bg-green-500' : 'bg-[#F9629F]'
                }`}>
                  {phoneVerified ? (
                    <FiCheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <FiPhone className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#000000]">Phone Verification</h2>
                  <p className="text-sm text-gray-600">{userProfile?.contactNumber || 'Not set'}</p>
                </div>
              </div>
              {phoneVerified && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Verified
                </span>
              )}
            </div>

            {!phoneVerified ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  We'll send a verification code to your phone number. Enter the code below to verify.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#F9629F] focus:ring-2 focus:ring-[#F9629F]/20 transition-all text-center text-2xl tracking-widest font-bold text-[#000000]"
                  />
                </div>
                <div className="flex gap-3">
                  <motion.button
                    onClick={verifyPhoneCode}
                    disabled={phoneCode.length !== 6 || verifyingPhone}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-gradient-to-r from-[#F9629F] to-[#F9629F] text-[#000000] font-bold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {verifyingPhone ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="w-5 h-5" />
                        Verify Phone
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={sendPhoneVerificationCode}
                    disabled={sendingPhoneCode || phoneCooldownRemaining > 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3 bg-gray-100 border-2 border-gray-200 text-[#000000] rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[7rem] justify-center"
                    title={phoneCooldownRemaining > 0 ? `Resend in ${formatCooldown(phoneCooldownRemaining)}` : 'Resend code'}
                  >
                    <FiRefreshCw className={`w-5 h-5 shrink-0 ${sendingPhoneCode ? 'animate-spin' : ''}`} />
                    {phoneCooldownRemaining > 0 ? (
                      <span className="text-sm">{formatCooldown(phoneCooldownRemaining)}</span>
                    ) : null}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-green-600 font-semibold">✓ Phone verified successfully!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Back to Profile | Shop now */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 sm:mt-6 lg:mt-8 flex items-center justify-between gap-4"
        >
          <a
            href="/dashboard/profile"
            className="text-[#F9629F] hover:text-[#F9629F] font-semibold transition-colors inline-flex items-center gap-2"
          >
            ← Back to Profile
          </a>
          <a
            href="/"
            className="text-[#F9629F] hover:text-[#F9629F] font-semibold transition-colors inline-flex items-center gap-2"
          >
            Shop now →
          </a>
        </motion.div>
      </div>
    </div>
  );
}
