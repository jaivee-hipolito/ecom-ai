'use client';

import { useEffect, useRef, useState } from 'react';
import Input from '@/components/ui/Input';

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  error?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces: () => void;
  }
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Start typing an address...',
  error,
  id = 'address',
  name = 'address',
  required = false,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Store callbacks in refs to ensure latest versions are used
  const onChangeRef = useRef(onChange);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  
  // Update refs when callbacks change
  useEffect(() => {
    onChangeRef.current = onChange;
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onChange, onPlaceSelect]);

  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsScriptLoaded(true);
      setIsLoading(false);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsScriptLoaded(true);
          setIsLoading(false);
          clearInterval(checkGoogle);
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }

    // Load Google Maps API script
    const script = document.createElement('script');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
      setIsLoading(false);
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsScriptLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript && existingScript.parentNode) {
        // Don't remove if other components might be using it
        // existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !inputRef.current || !window.google) {
      return;
    }

    // Initialize autocomplete
    if (!autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          componentRestrictions: { country: ['ca', 'us'] }, // Restrict to Canada and US
          // Request all necessary fields for address parsing
          fields: [
            'address_components',
            'formatted_address',
            'geometry',
            'name',
            'place_id'
          ],
          types: ['address'],
        }
      );

      // Listen for place selection
      autocompleteRef.current.addListener('place_changed', () => {
        console.log('=== Place changed event fired ===');
        const place = autocompleteRef.current?.getPlace();
        console.log('Place result:', place);
        
        if (!place) {
          console.warn('No place returned from autocomplete');
          return;
        }

        // Log address components for debugging
        if (place.address_components) {
          console.log('Address components received:', place.address_components);
          place.address_components.forEach((comp, index) => {
            console.log(`Component ${index}:`, {
              long_name: comp.long_name,
              short_name: comp.short_name,
              types: comp.types
            });
          });
        } else {
          console.warn('No address_components in place result');
        }

        // Update the input value with formatted address
        if (place.formatted_address) {
          console.log('Updating input with formatted address:', place.formatted_address);
          onChangeRef.current(place.formatted_address);
        }
        
        // Call the place select handler to populate other fields
        if (place.address_components && place.address_components.length > 0) {
          console.log('Calling onPlaceSelect handler');
          onPlaceSelectRef.current(place);
        } else {
          console.error('Cannot call onPlaceSelect: missing address_components');
          // Still try to update the address field even if components are missing
          if (place.formatted_address) {
            onChangeRef.current(place.formatted_address);
          }
        }
      });
    }

    return () => {
      // Cleanup autocomplete listeners
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isScriptLoaded]); // Only depend on script loading, callbacks are accessed via refs

  // Fallback to regular input if API key is not available
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && !isScriptLoaded) {
    return (
      <Input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        error={error}
      />
    );
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isLoading ? 'Loading address suggestions...' : placeholder}
        required={required}
        error={error}
        disabled={isLoading}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#ffa509] rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
