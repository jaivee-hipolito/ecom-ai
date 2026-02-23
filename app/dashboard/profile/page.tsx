'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { useRouter } from 'next/navigation';
import { FiLock, FiEye, FiEyeOff, FiPhone, FiEdit2, FiX } from 'react-icons/fi';
import { normalizePhoneNumber } from '@/lib/phone';

const MIN_PHONE_DIGITS = 10;
const MAX_PHONE_DIGITS = 15;

function validatePhoneNumber(value: string): { valid: boolean; message?: string } {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, message: 'Please enter a phone number' };
  const normalized = normalizePhoneNumber(trimmed);
  const digitCount = (normalized.match(/\d/g) || []).length;
  if (digitCount < MIN_PHONE_DIGITS) {
    return { valid: false, message: `Phone number must have at least ${MIN_PHONE_DIGITS} digits` };
  }
  if (digitCount > MAX_PHONE_DIGITS) {
    return { valid: false, message: `Phone number must have at most ${MAX_PHONE_DIGITS} digits` };
  }
  if (!/^\+?\d+$/.test(normalized)) {
    return { valid: false, message: 'Phone number can only contain digits and an optional + at the start' };
  }
  return { valid: true };
}

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email: string;
  role: string;
  image?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editContactNumber, setEditContactNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          password: passwordForm.newPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPasswordError(data.error || 'Failed to change password');
        return;
      }

      setPasswordSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const startEditPhone = () => {
    setEditContactNumber(userProfile?.contactNumber || '');
    setPhoneError('');
    setPhoneSuccess('');
    setIsEditingPhone(true);
  };

  const cancelEditPhone = () => {
    setIsEditingPhone(false);
    setEditContactNumber('');
    setPhoneError('');
  };

  const handleSavePhone = async (e: FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setPhoneSuccess('');
    const trimmed = editContactNumber.trim();
    const validation = validatePhoneNumber(trimmed);
    if (!validation.valid) {
      setPhoneError(validation.message || 'Invalid phone number');
      return;
    }
    setIsSavingPhone(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactNumber: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPhoneError(data.error || 'Failed to update phone number');
        return;
      }
      setUserProfile((prev) => (prev ? { ...prev, contactNumber: data.user?.contactNumber ?? trimmed, phoneVerified: data.user?.phoneVerified ?? false } : null));
      setPhoneSuccess('Phone number updated. Please verify your new number in the Verify page.');
      setIsEditingPhone(false);
      setEditContactNumber('');
      setTimeout(() => setPhoneSuccess(''), 8000);
    } catch {
      setPhoneError('An error occurred. Please try again.');
    } finally {
      setIsSavingPhone(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="Loading profile..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-medium text-gray-900">
                {userProfile?.firstName && userProfile?.lastName
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FiPhone className="w-4 h-4" />
                Contact Number
              </p>
              {!isEditingPhone ? (
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-lg font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                    {userProfile?.contactNumber || 'Not set'}
                    {userProfile?.contactNumber && (
                      userProfile?.phoneVerified ? (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Verified</span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Not Verified</span>
                      )
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={startEditPhone}
                    className="text-sm text-[#F9629F] hover:text-[#FC9BC2] font-medium inline-flex items-center gap-1 shrink-0"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Change
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSavePhone} className="mt-2 space-y-2">
                  {phoneError && (
                    <div className="p-2 bg-red-50 text-red-700 rounded-lg text-sm">{phoneError}</div>
                  )}
                  {phoneSuccess && (
                    <div className="p-2 bg-green-50 text-green-700 rounded-lg text-sm">{phoneSuccess}</div>
                  )}
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={editContactNumber}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditContactNumber(v.replace(/[^\d+\s\-()]/g, ''));
                    }}
                    placeholder="e.g. +1 234 567 8900"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] text-gray-900 placeholder-gray-500 bg-white"
                    autoFocus
                    maxLength={20}
                    aria-invalid={!!editContactNumber && !validatePhoneNumber(editContactNumber.trim()).valid}
                    aria-describedby={editContactNumber.trim() && !validatePhoneNumber(editContactNumber.trim()).valid ? 'phone-helper' : undefined}
                  />
                  {editContactNumber.trim() && !validatePhoneNumber(editContactNumber.trim()).valid && (
                    <p id="phone-helper" className="text-sm text-amber-600">
                      Enter at least {MIN_PHONE_DIGITS} digits (e.g. +1 234 567 8900)
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSavingPhone || !validatePhoneNumber(editContactNumber.trim()).valid}
                      className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-white bg-[#F9629F] hover:bg-[#e8558a] focus:ring-2 focus:ring-[#F9629F] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#F9629F]"
                    >
                      {isSavingPhone ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditPhone}
                      disabled={isSavingPhone}
                      className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <FiX className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-medium text-gray-900 flex items-center gap-2">
                {userProfile?.email || 'N/A'}
                {userProfile?.emailVerified ? (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Verified</span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Not Verified</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-medium text-gray-900 capitalize">{userProfile?.role || 'N/A'}</p>
            </div>
          </div>
          
          {/* Verification Link + $5 off offer */}
          {(!userProfile?.emailVerified || !userProfile?.phoneVerified) && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                <p className="text-emerald-800 font-semibold text-sm mb-1">Get $5 off your first order!</p>
                <p className="text-emerald-700 text-xs">Verify both your phone number and email to receive a one-time $5 discount at checkout.</p>
              </div>
              <Link
                href="/dashboard/verify"
                className="block w-full bg-gradient-to-r from-[#F9629F] to-[#FC9BC2] text-[#000000] font-bold py-3 px-6 rounded-xl text-center hover:shadow-lg transition-all"
              >
                Verify Email & Phone
              </Link>
            </div>
          )}
        </div>

        {/* Addresses Card */}
        <Link href="/dashboard/profile/addresses" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Shipping Addresses</h2>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <p className="text-gray-600">Manage your shipping addresses</p>
          <Button variant="outline" className="mt-4 w-full">
            Manage Addresses
          </Button>
        </Link>

        {/* Change Password Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiLock className="w-5 h-5 text-[#F9629F]" />
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{passwordSuccess}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] pr-10 text-gray-900 placeholder-gray-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] pr-10 text-gray-900 placeholder-gray-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F9629F] focus:border-[#F9629F] pr-10 text-gray-900 placeholder-gray-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-[#FDE8F0] text-[#000000] border border-gray-300 hover:bg-[#FC9BC2]"
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>

        {/* Orders Card */}
        <Link href="/dashboard/orders" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          <p className="text-gray-600">View your order history</p>
          <Button variant="outline" className="mt-4 w-full">
            View Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}

