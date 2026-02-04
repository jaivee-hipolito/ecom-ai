'use client';

import { useState, useEffect } from 'react';
import { IAddress, ShippingAddress } from '@/types/address';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { FiMapPin, FiCheck, FiPlus } from 'react-icons/fi';

interface ShippingAddressDisplayProps {
  onAddressSelect?: (address: ShippingAddress) => void;
  selectedAddressId?: string | null;
}

export default function ShippingAddressDisplay({ 
  onAddressSelect,
  selectedAddressId: externalSelectedAddressId 
}: ShippingAddressDisplayProps = {}) {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<IAddress | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users/addresses');
        if (response.ok) {
          const data = await response.json();
          const addressesList = data.addresses || [];
          setAddresses(addressesList);
          // Find default address or first address
          const defaultAddr = addressesList.find((addr: IAddress) => addr.isDefault) || addressesList[0];
          setDefaultAddress(defaultAddr || null);
          
          // Set selected address (use external if provided, otherwise use default)
          const addressToSelect = externalSelectedAddressId 
            ? addressesList.find((addr: IAddress) => addr._id === externalSelectedAddressId)
            : defaultAddr;
          
          if (addressToSelect) {
            setSelectedAddressId(addressToSelect._id!);
            // Notify parent component
            if (onAddressSelect) {
              onAddressSelect({
                fullName: addressToSelect.fullName,
                address: addressToSelect.address,
                city: addressToSelect.city,
                state: addressToSelect.state,
                zipCode: addressToSelect.zipCode,
                country: addressToSelect.country,
                phone: addressToSelect.phone,
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [externalSelectedAddressId, onAddressSelect]);

  const handleAddressSelect = (address: IAddress) => {
    setSelectedAddressId(address._id!);
    if (onAddressSelect) {
      onAddressSelect({
        fullName: address.fullName,
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
      });
    }
  };

  const currentAddress = addresses.find(addr => addr._id === selectedAddressId) || defaultAddress;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/4"></div>
        </div>
      </div>
    );
  }

  if (!currentAddress) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-2 rounded-lg">
            <FiMapPin className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[#050b2c]">Shipping Address</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">No shipping address saved</p>
        <Link href="/profile/addresses">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" size="sm" className="w-full border-[#ffa509] text-[#ffa509] hover:bg-[#ffa509] hover:text-white">
              <FiPlus className="mr-2 w-4 h-4" />
              Add Shipping Address
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] p-2 rounded-lg">
            <FiMapPin className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[#050b2c]">Shipping Address</h3>
        </div>
        {currentAddress.isDefault && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white">
            Default
          </span>
        )}
      </div>
      
      {addresses.length > 1 && (
        <div className="mb-4 space-y-3">
          {addresses.map((address, index) => (
            <motion.div
              key={address._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleAddressSelect(address)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedAddressId === address._id
                  ? 'border-[#ffa509] bg-gradient-to-br from-[#ffa509]/10 to-[#ff8c00]/5 shadow-md'
                  : 'border-gray-200 hover:border-[#ffa509]/50 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {address.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#ffa509]/20 text-[#ffa509] mb-2">
                      Default
                    </span>
                  )}
                  <p className="text-sm font-bold text-[#050b2c] mb-1">{address.fullName}</p>
                  <p className="text-xs text-gray-600 mb-1">{address.address}</p>
                  <p className="text-xs text-gray-600">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                </div>
                {selectedAddressId === address._id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-[#ffa509] to-[#ff8c00] rounded-full p-1.5"
                  >
                    <FiCheck className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {addresses.length === 1 && (
        <div className="space-y-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
          <p className="font-bold text-[#050b2c]">{currentAddress.fullName}</p>
          <p>{currentAddress.address}</p>
          <p>
            {currentAddress.city}, {currentAddress.state} {currentAddress.zipCode}
          </p>
          <p>{currentAddress.country}</p>
          <p className="text-gray-600">Phone: {currentAddress.phone}</p>
        </div>
      )}

      <Link href="/profile/addresses" className="block mt-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" size="sm" className="w-full border-[#ffa509] text-[#ffa509] hover:bg-[#ffa509] hover:text-white">
            {addresses.length > 1 ? 'Manage Addresses' : 'Change Address'}
          </Button>
        </motion.div>
      </Link>
    </motion.div>
  );
}
