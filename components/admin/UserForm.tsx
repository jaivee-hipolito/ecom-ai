'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiMail,
  FiLock,
  FiShield,
  FiSave,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiEye,
  FiEyeOff,
  FiPhone,
} from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface UserFormProps {
  onSuccess?: () => void;
}

export default function UserForm({ onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

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
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          contactNumber: formData.contactNumber,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        setError('Server returned an invalid response. Please try again.');
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create user');
        setIsLoading(false);
        return;
      }

      // Success - call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'An error occurred while creating the user');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const passwordMatch = formData.password === confirmPassword && confirmPassword.length > 0;
  const passwordLength = formData.password.length >= 6;
  const passwordStrength = passwordMatch && passwordLength;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Alert variant="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Basic Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-6 border-2 border-blue-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#050b2c]">Basic Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-semibold text-[#050b2c] mb-2 flex items-center gap-2">
                <FiUser className="w-4 h-4 text-[#ffa509]" />
                First Name
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Enter first name"
                className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 bg-white"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-semibold text-[#050b2c] mb-2 flex items-center gap-2">
                <FiUser className="w-4 h-4 text-[#ffa509]" />
                Last Name
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Enter last name"
                className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 bg-white"
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-semibold text-[#050b2c] mb-2 flex items-center gap-2">
                <FiPhone className="w-4 h-4 text-[#ffa509]" />
                Contact Number
              </label>
              <Input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                placeholder="Enter contact number"
                className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 bg-white"
              />
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-semibold text-[#050b2c] mb-2 flex items-center gap-2">
                <FiMail className="w-4 h-4 text-[#ffa509]" />
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
                className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 bg-white"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl p-6 border-2 border-purple-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <FiLock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#050b2c]">Password</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-semibold text-[#050b2c] mb-2 flex items-center gap-2">
                <FiLock className="w-4 h-4 text-[#ffa509]" />
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password (min 6 characters)"
                  className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 bg-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ffa509] transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center gap-2"
                >
                  {passwordLength ? (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                      <FiCheck className="w-3 h-3" />
                      Minimum 6 characters
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                      <FiX className="w-3 h-3" />
                      Must be at least 6 characters
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
              <label className="block text-sm font-semibold text-[#050b2c] mb-2 flex items-center gap-2">
                <FiLock className="w-4 h-4 text-[#ffa509]" />
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm password"
                  className={`border-2 ${
                    confirmPassword
                      ? passwordMatch
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#ffa509]'
                  } focus:ring-[#ffa509]/20 bg-white pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#ffa509] transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center gap-2"
                >
                  {passwordMatch ? (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                      <FiCheck className="w-3 h-3" />
                      Passwords match
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-red-600 font-semibold">
                      <FiX className="w-3 h-3" />
                      Passwords do not match
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Role Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-white to-orange-50/30 rounded-xl p-6 border-2 border-orange-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <FiShield className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#050b2c]">User Role</h2>
          </div>
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center gap-2 mb-2">
              <FiShield className="w-4 h-4 text-[#ffa509]" />
              <label className="block text-sm font-semibold text-[#050b2c]">
                Role
              </label>
            </div>
            <Select
              label=""
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: 'customer', label: 'Customer' },
                { value: 'admin', label: 'Admin' },
              ]}
              className="border-2 border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]/20 bg-white"
            />
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2">
                {formData.role === 'admin' ? (
                  <>
                    <FiShield className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-semibold text-purple-700">
                      Admin users have full access to the admin panel
                    </p>
                  </>
                ) : (
                  <>
                    <FiUser className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-700">
                      Customer users can browse and purchase products
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t-2 border-gray-200"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                firstName: '',
                lastName: '',
                contactNumber: '',
                email: '',
                password: '',
                role: 'customer',
              });
              setConfirmPassword('');
              setError('');
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
            className="border-2 border-[#050b2c] text-[#050b2c] hover:bg-[#050b2c] hover:text-white font-semibold px-6 py-3"
          >
            <FiRefreshCw className="w-4 h-4 mr-2 inline" />
            Reset
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={!passwordStrength}
            className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] hover:from-[#ff8c00] hover:to-[#ffa509] border-0 text-white font-semibold shadow-lg px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isLoading && <FiSave className="w-4 h-4 mr-2 inline" />}
            Create User
          </Button>
        </motion.div>
      </motion.div>
    </form>
  );
}

