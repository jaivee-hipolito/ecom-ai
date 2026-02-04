'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function SettingsForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    contactNumber: user?.contactNumber || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          setFormData({
            firstName: data.user?.firstName || '',
            lastName: data.user?.lastName || '',
            contactNumber: data.user?.contactNumber || '',
            email: data.user?.email || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to AuthContext user data
    if (user) {
      setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            contactNumber: user.contactNumber || '',
        email: user.email || '',
      });
    }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          contactNumber: formData.contactNumber,
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update profile');
        setIsLoading(false);
        return;
      }

      // Update form data with the response
      if (data.user) {
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          contactNumber: data.user.contactNumber || '',
          email: data.user.email || '',
        });
      }

      setSuccessMessage('Profile updated successfully!');
      setIsLoading(false);
      
      // Refresh router to update session data
      router.refresh();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating profile');
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsPasswordLoading(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
          currentPassword: passwordData.currentPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update password');
        setIsPasswordLoading(false);
        return;
      }

      setSuccessMessage('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsPasswordLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating password');
      setIsPasswordLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('profile');
              setError('');
              setSuccessMessage('');
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Settings
          </button>
          <button
            onClick={() => {
              setActiveTab('password');
              setError('');
              setSuccessMessage('');
            }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Change Password
          </button>
        </nav>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
            />

            <Input
              label="Last Name"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Enter your last name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Contact Number"
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              placeholder="Enter your contact number"
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {/* Password Change Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
            placeholder="Enter your current password"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Enter new password (min 6 characters)"
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" isLoading={isPasswordLoading}>
              Update Password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

