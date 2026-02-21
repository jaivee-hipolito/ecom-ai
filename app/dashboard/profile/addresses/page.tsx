'use client';

import { useState, useEffect } from 'react';
import AddressCard from '@/components/profile/AddressCard';
import AddressForm from '@/components/checkout/AddressForm';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { IAddress, ShippingAddress } from '@/types/address';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddressesPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const response = await fetch('/api/users/addresses');
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      const data = await response.json();
      setAddresses(data.addresses || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load addresses');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleAddAddress = async (addressData: ShippingAddress) => {
    console.log('=== handleAddAddress called ===');
    console.log('addressData:', addressData);
    console.log('user:', user);
    console.log('user?.name:', user?.name);
    
    try {
      setIsSaving(true);
      setError(null);

      // Use user's name from profile (required)
      const fullName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`.trim()
        : '';
      console.log('Full name to use:', fullName);
      
      if (!fullName) {
        console.error('User name is missing!');
        setIsSaving(false);
        setError('User name is required. Please update your profile name first.');
        return;
      }

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout. Please try again.')), 30000)
      );

      const requestBody = {
        ...addressData,
        fullName: fullName,
        phone: addressData.phone?.trim() || (user?.contactNumber as string)?.trim() || '',
        isDefault: addresses.length === 0, // Set as default if it's the first address
      };
      
      console.log('Making API request with body:', requestBody);
      
      const fetchPromise = fetch('/api/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!response.ok) {
        let errorMessage = `Failed to add address: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }

      await response.json();
      setIsSaving(false);
      setShowAddForm(false);
      setEditingAddress(null);
      await fetchAddresses();
    } catch (err: any) {
      console.error('Error adding address:', err);
      setError(err.message || 'Failed to add address. Please try again.');
      setIsSaving(false);
    }
  };

  const handleEditAddress = async (addressData: ShippingAddress) => {
    console.log('handleEditAddress called with:', addressData);
    console.log('Editing address:', editingAddress);
    console.log('User:', user);
    
    if (!editingAddress?._id) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Use user's name from profile
      const fullName = user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`.trim()
        : '';
      console.log('Full name to use:', fullName);
      
      if (!fullName) {
        setIsSaving(false);
        setError('User name is required. Please update your profile name first.');
        return;
      }

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout. Please try again.')), 30000)
      );

      const fetchPromise = fetch(`/api/users/addresses/${editingAddress._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...addressData,
          fullName: fullName,
          phone: addressData.phone?.trim() || (user?.contactNumber as string)?.trim() || '',
        }),
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (!response.ok) {
        let errorMessage = `Failed to update address: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Response is not JSON, use status text
        }
        throw new Error(errorMessage);
      }

      await response.json();
      setIsSaving(false);
      setEditingAddress(null);
      await fetchAddresses();
    } catch (err: any) {
      console.error('Error updating address:', err);
      setError(err.message || 'Failed to update address. Please try again.');
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      setIsDeleting(addressId);
      setError(null);

      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete address');
      }

      await fetchAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to delete address');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setError(null);
      setSuccessMessage(null);
      setIsSettingDefault(addressId);

      console.log('Setting default address:', addressId);

      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to set default address' }));
        throw new Error(errorData.error || `Failed to set default address: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Default address set successfully:', result);

      // Refresh addresses list without showing full page loading
      const refreshResponse = await fetch('/api/users/addresses');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setAddresses(refreshData.addresses || []);
        setSuccessMessage('Default address updated successfully');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('Failed to refresh addresses');
      }
    } catch (err: any) {
      console.error('Error setting default address:', err);
      setError(err.message || 'Failed to set default address');
    } finally {
      setIsSettingDefault(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="lg" text="Loading addresses..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/profile" className="text-[#F9629F] hover:text-[#e8558a] mb-4 inline-block font-medium transition-colors">
          ← Back to Profile
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
        <p className="mt-2 text-gray-600">Manage your shipping addresses</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {successMessage}
        </div>
      )}

      {!showAddForm && !editingAddress && (
        <div className="mb-6">
          <Button onClick={() => setShowAddForm(true)}>Add New Address</Button>
        </div>
      )}

      {(showAddForm || editingAddress) && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          <AddressForm
            onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
            initialData={editingAddress || undefined}
            isLoading={isSaving}
            showFullName={false}
            showPhone={!user?.contactNumber?.trim()}
            buttonText="Save"
            loadingButtonText="Saving..."
          />
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setEditingAddress(null);
                setError(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !showAddForm && !editingAddress ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg
            className="mx-auto h-24 w-24 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No addresses saved</h3>
          <p className="mt-2 text-gray-600">Add your first shipping address to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onEdit={setEditingAddress}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefault}
              isDeleting={isDeleting === address._id}
              isSettingDefault={isSettingDefault === address._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

