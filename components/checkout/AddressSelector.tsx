'use client';

import { useState, useEffect } from 'react';
import { IAddress, ShippingAddress } from '@/types/address';
import AddressForm from './AddressForm';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { motion } from 'framer-motion';
import { FiMapPin, FiCheck, FiPlus } from 'react-icons/fi';

interface AddressSelectorProps {
  onSelect: (address: ShippingAddress) => void;
  isLoading?: boolean;
}

export default function AddressSelector({ onSelect, isLoading = false }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const response = await fetch('/api/users/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
        // Auto-select default address if available
        const defaultAddress = data.addresses?.find((addr: IAddress) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id!);
          onSelect({
            fullName: defaultAddress.fullName,
            address: defaultAddress.address,
            city: defaultAddress.city,
            state: defaultAddress.state,
            zipCode: defaultAddress.zipCode,
            country: defaultAddress.country,
            phone: defaultAddress.phone,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleAddressSelect = (address: IAddress) => {
    setSelectedAddressId(address._id!);
    setShowNewAddressForm(false);
    onSelect({
      fullName: address.fullName,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
    });
  };

  const handleNewAddressSubmit = async (addressData: ShippingAddress) => {
    try {
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...addressData,
          isDefault: addresses.length === 0,
        }),
      });

      if (response.ok) {
        await fetchAddresses();
        setShowNewAddressForm(false);
        // Select the newly created address
        onSelect(addressData);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save address');
      }
    } catch (error) {
      alert('Failed to save address');
    }
  };

  if (isLoadingAddresses) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loading size="md" text="Loading addresses..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {addresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#050b2c]">Select a saved address</h3>
          <div className="space-y-3">
            {addresses.map((address, index) => (
              <motion.div
                key={address._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAddressSelect(address)}
                className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedAddressId === address._id
                    ? 'border-[#ffa509] bg-gradient-to-br from-[#ffa509]/10 to-[#ff8c00]/5 shadow-lg'
                    : 'border-gray-200 hover:border-[#ffa509]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {address.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white mb-2">
                        Default
                      </span>
                    )}
                    <h4 className="font-bold text-[#050b2c] text-base sm:text-lg mb-1">{address.fullName}</h4>
                    <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">{address.country}</p>
                    <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                  </div>
                  <div className="ml-4">
                    {selectedAddressId === address._id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-full p-1.5"
                      >
                        <FiCheck className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        {!showNewAddressForm ? (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={() => {
                setShowNewAddressForm(true);
                setSelectedAddressId(null);
              }}
              className="w-full px-4 py-3 border-2 border-[#ffa509] text-[#ffa509] rounded-xl hover:bg-[#ffa509] hover:text-white transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              {addresses.length > 0 ? 'Add New Address' : 'Add Address'}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#050b2c]">Add New Address</h3>
            <AddressForm
              onSubmit={handleNewAddressSubmit}
              isLoading={isLoading}
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => {
                  setShowNewAddressForm(false);
                  // Re-select previous address if any
                  if (selectedAddressId) {
                    const prevAddress = addresses.find((a) => a._id === selectedAddressId);
                    if (prevAddress) {
                      handleAddressSelect(prevAddress);
                    }
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
