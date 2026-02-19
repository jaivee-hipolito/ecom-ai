'use client';

import { useState, useEffect } from 'react';
import { ShippingAddress } from '@/types/address';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';
import { motion } from 'framer-motion';

interface AddressFormProps {
  onSubmit: (address: ShippingAddress) => void | Promise<void>;
  initialData?: ShippingAddress;
  isLoading?: boolean;
  showFullName?: boolean;
  buttonText?: string;
  loadingButtonText?: string;
}

export default function AddressForm({
  onSubmit,
  initialData,
  isLoading = false,
  showFullName = true,
  buttonText = 'Continue to Payment',
  loadingButtonText = 'Processing...',
}: AddressFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>(
    initialData || {
      fullName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'CA',
      phone: '',
    }
  );

  // Update formData when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ShippingAddress]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    console.log('=== handlePlaceSelect called ===');
    console.log('Place object:', place);
    console.log('Address components:', place.address_components);
    console.log('Formatted address:', place.formatted_address);

    if (!place.address_components || place.address_components.length === 0) {
      console.warn('No address components found in place result');
      // Try to use formatted_address as fallback
      if (place.formatted_address) {
        setFormData((prev) => ({
          ...prev,
          address: place.formatted_address || prev.address,
        }));
      }
      return;
    }

    const addressComponents = place.address_components;
    const newFormData: Partial<ShippingAddress> = {};

    let streetNumber = '';
    let route = '';
    let subpremise = '';

    // Helper function to get component by type
    const getComponent = (type: string) => {
      return addressComponents.find((comp: google.maps.places.AddressComponent) => comp.types.includes(type));
    };

    // Parse address components - check all types for each component
    addressComponents.forEach((component: google.maps.places.AddressComponent) => {
      const types = component.types;
      console.log(`Component: ${component.long_name}, Types:`, types);

      // Street address components
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        route = component.long_name;
      }
      if (types.includes('subpremise')) {
        subpremise = component.long_name;
      }
      
      // City - check multiple possible component types with priority
      if (!newFormData.city) {
        if (types.includes('locality')) {
          newFormData.city = component.long_name;
        } else if (types.includes('postal_town')) {
          newFormData.city = component.long_name;
        } else if (types.includes('sublocality')) {
          newFormData.city = component.long_name;
        } else if (types.includes('sublocality_level_1')) {
          newFormData.city = component.long_name;
        } else if (types.includes('administrative_area_level_2')) {
          // Sometimes city is in administrative_area_level_2
        newFormData.city = component.long_name;
        }
      }
      
      // State/Province - use short_name for abbreviations
      if (types.includes('administrative_area_level_1')) {
        newFormData.state = component.short_name || component.long_name;
      }
      
      // Postal/ZIP code
      if (types.includes('postal_code')) {
        newFormData.zipCode = component.long_name;
      }
      
      // Country
      if (types.includes('country')) {
        const countryCode = component.short_name;
        // Map common country codes
        if (countryCode === 'CA') {
          newFormData.country = 'CA';
        } else if (countryCode === 'US') {
          newFormData.country = 'US';
        } else {
          newFormData.country = countryCode;
        }
      }
    });

    // Build street address
    const addressParts: string[] = [];
    if (streetNumber) addressParts.push(streetNumber);
    if (route) addressParts.push(route);
    if (subpremise) addressParts.push(subpremise);
    
    if (addressParts.length > 0) {
      newFormData.address = addressParts.join(' ').trim();
    }

    // Fallback: Try to extract from formatted_address if components are missing
    if (!newFormData.address && place.formatted_address) {
      // Extract street address from formatted_address (everything before the first comma usually)
      const parts = place.formatted_address.split(',');
      if (parts.length > 0) {
        newFormData.address = parts[0].trim();
      } else {
      newFormData.address = place.formatted_address;
    }
    }

    // Fallback for city: try to extract from formatted_address
    if (!newFormData.city && place.formatted_address) {
      const parts = place.formatted_address.split(',');
      // Usually city is the second or third part
      if (parts.length >= 2) {
        // Try second part (might be city)
        const potentialCity = parts[1].trim();
        // If it doesn't look like a state/province (too long or contains numbers), it might be city
        if (potentialCity.length > 2 && !/^\d/.test(potentialCity)) {
          newFormData.city = potentialCity;
        }
      }
    }

    console.log('Parsed form data:', newFormData);

    // Update form data with parsed values
    setFormData((prev) => {
      const updated = {
      ...prev,
        // Always update address if we have it
      address: newFormData.address || prev.address,
        // Only update other fields if we successfully parsed them
        city: newFormData.city || prev.city,
        state: newFormData.state || prev.state,
        zipCode: newFormData.zipCode || prev.zipCode,
        country: newFormData.country || prev.country,
      };
      console.log('Updated form data:', updated);
      return updated;
    });

    // Clear address-related errors
    setErrors((prev) => ({
      ...prev,
      address: undefined,
      city: undefined,
      state: undefined,
      zipCode: undefined,
      country: undefined,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (showFullName && !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== Form Submit Started ===');
    console.log('Form data:', formData);
    console.log('isLoading:', isLoading);
    console.log('showFullName:', showFullName);
    
    // Validate form synchronously
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    
    if (showFullName && !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    // Update errors state
    setErrors(newErrors);
    
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Validation result:', isValid);
    console.log('Validation errors:', newErrors);
    
    if (isValid) {
      console.log('✅ Validation passed, calling onSubmit');
      console.log('Form data being submitted:', formData);
      // Call onSubmit immediately - parent component handles async and loading state
      try {
        const result = onSubmit(formData);
        console.log('onSubmit called, result:', result);
        // If onSubmit returns a promise and it rejects, log it but don't block
        if (result && typeof result.catch === 'function') {
          result.catch((error: any) => {
            console.error('❌ Form submission error:', error);
          });
        }
      } catch (error) {
        console.error('❌ Error calling onSubmit:', error);
      }
    } else {
      console.log('❌ Validation failed, errors:', newErrors);
      // Scroll to first error field
      const errorFields = Object.keys(newErrors);
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0];
        setTimeout(() => {
          const element = document.getElementById(firstErrorField);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }, 100);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {Object.keys(errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800 text-sm font-semibold shadow-lg"
        >
          Please fix the errors below before submitting.
        </motion.div>
      )}
      {showFullName && (
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            required
            error={errors.fullName}
            placeholder="John Doe"
          />
        </div>
      )}

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address *
        </label>
        <GooglePlacesAutocomplete
          id="address"
          name="address"
          value={formData.address}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, address: value }));
            if (errors.address) {
              setErrors((prev) => ({ ...prev, address: undefined }));
            }
          }}
          onPlaceSelect={handlePlaceSelect}
          placeholder="Start typing an address..."
          error={errors.address}
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          💡 Start typing to see address suggestions from Google Maps
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <Input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            required
            error={errors.city}
            placeholder="Victoria"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State/Province *
          </label>
          <Input
            id="state"
            name="state"
            type="text"
            value={formData.state}
            onChange={handleChange}
            required
            error={errors.state}
            placeholder="BC"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP/Postal Code *
          </label>
          <Input
            id="zipCode"
            name="zipCode"
            type="text"
            value={formData.zipCode}
            onChange={handleChange}
            required
            error={errors.zipCode}
            placeholder="V8W 1A1"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <Select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            error={errors.country}
            options={[
              { value: 'US', label: 'United States' },
              { value: 'CA', label: 'Canada' },
              { value: 'GB', label: 'United Kingdom' },
              { value: 'AU', label: 'Australia' },
              { value: 'DE', label: 'Germany' },
              { value: 'FR', label: 'France' },
              { value: 'IT', label: 'Italy' },
              { value: 'ES', label: 'Spain' },
              { value: 'NL', label: 'Netherlands' },
              { value: 'BE', label: 'Belgium' },
              { value: 'CH', label: 'Switzerland' },
              { value: 'AT', label: 'Austria' },
              { value: 'SE', label: 'Sweden' },
              { value: 'NO', label: 'Norway' },
              { value: 'DK', label: 'Denmark' },
              { value: 'FI', label: 'Finland' },
              { value: 'PL', label: 'Poland' },
              { value: 'PT', label: 'Portugal' },
              { value: 'IE', label: 'Ireland' },
              { value: 'NZ', label: 'New Zealand' },
              { value: 'SG', label: 'Singapore' },
              { value: 'MY', label: 'Malaysia' },
              { value: 'PH', label: 'Philippines' },
              { value: 'TH', label: 'Thailand' },
              { value: 'VN', label: 'Vietnam' },
              { value: 'ID', label: 'Indonesia' },
              { value: 'IN', label: 'India' },
              { value: 'JP', label: 'Japan' },
              { value: 'KR', label: 'South Korea' },
              { value: 'CN', label: 'China' },
              { value: 'HK', label: 'Hong Kong' },
              { value: 'TW', label: 'Taiwan' },
              { value: 'BR', label: 'Brazil' },
              { value: 'MX', label: 'Mexico' },
              { value: 'AR', label: 'Argentina' },
              { value: 'CL', label: 'Chile' },
              { value: 'CO', label: 'Colombia' },
              { value: 'PE', label: 'Peru' },
              { value: 'ZA', label: 'South Africa' },
              { value: 'EG', label: 'Egypt' },
              { value: 'AE', label: 'United Arab Emirates' },
              { value: 'SA', label: 'Saudi Arabia' },
              { value: 'IL', label: 'Israel' },
              { value: 'TR', label: 'Turkey' },
              { value: 'RU', label: 'Russia' },
            ]}
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          required
          error={errors.phone}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-3 bg-[#FDE8F0] text-[#1a1a1a] border border-gray-300 hover:bg-[#FC9BC2] rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base sm:text-lg flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>{loadingButtonText}</span>
          </>
        ) : (
          <>
            <span>{buttonText}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </motion.button>
    </form>
  );
}
