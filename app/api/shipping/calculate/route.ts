import { NextRequest, NextResponse } from 'next/server';
import { ShippingAddress } from '@/types/address';

// Force Node.js runtime
export const runtime = 'nodejs';

// Store location: Regina Avenue, Victoria, BC (free shipping within 15km)
const STORE_LOCATION = {
  address: 'Regina Avenue, Victoria, BC, Canada',
  lat: 48.428,
  lng: -123.3645,
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

/**
 * Geocode address to coordinates using Google Maps Geocoding API
 */
async function geocodeAddress(address: ShippingAddress): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Maps API key not configured. Using fallback distance calculation.');
    return null;
  }

  try {
    // Construct full address string
    const fullAddress = `${address.address}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    console.warn('Geocoding failed:', data.status);
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

const SHIPPING_BASE_FEE = 3; // Flat fee added to shipping (except within free radius)

/** Free shipping radius in km from store (Regina Avenue, Victoria, BC) */
const FREE_SHIPPING_RADIUS_KM = 15;

/**
 * Calculate shipping fee based on distance from Regina Avenue, Victoria, BC.
 * - $0 within 15km
 * - $8 for 15–25km
 * - $13 for 25–50km
 * - $18 for 50–100km
 * - $23 for 100km+
 */
function calculateShippingFee(distanceKm: number): number {
  if (distanceKm <= FREE_SHIPPING_RADIUS_KM) {
    return 0; // Free shipping within 15km of store
  }
  let base = 0;
  if (distanceKm <= 25) base = 5;
  else if (distanceKm <= 50) base = 10;
  else if (distanceKm <= 100) base = 15;
  else base = 20;
  return base + SHIPPING_BASE_FEE;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shippingAddress }: { shippingAddress: ShippingAddress } = body;

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Validate required address fields
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      return NextResponse.json(
        { error: 'Complete shipping address is required' },
        { status: 400 }
      );
    }

    // Geocode customer address
    const customerLocation = await geocodeAddress(shippingAddress);

    if (!customerLocation) {
      // Fallback: if city is Victoria and state is BC, assume within free radius
      if (
        shippingAddress.city.toLowerCase().includes('victoria') &&
        (shippingAddress.state.toLowerCase().includes('bc') ||
         shippingAddress.state.toLowerCase().includes('british columbia'))
      ) {
        return NextResponse.json({
          distance: 0,
          shippingFee: 0,
          message: `Free shipping within ${FREE_SHIPPING_RADIUS_KM}km of Regina Avenue, Victoria`,
        });
      }

      // Default shipping fee if geocoding fails
      return NextResponse.json({
        distance: null,
        shippingFee: 10 + SHIPPING_BASE_FEE,
        message: 'Unable to calculate exact distance. Standard shipping fee applied.',
      });
    }

    // Calculate distance from store to customer
    const distance = calculateDistance(
      STORE_LOCATION.lat,
      STORE_LOCATION.lng,
      customerLocation.lat,
      customerLocation.lng
    );

    // Calculate shipping fee based on distance
    const shippingFee = calculateShippingFee(distance);

    return NextResponse.json({
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      shippingFee,
      storeLocation: STORE_LOCATION.address,
      customerLocation: {
        lat: customerLocation.lat,
        lng: customerLocation.lng,
      },
      message: distance <= FREE_SHIPPING_RADIUS_KM
        ? `Free shipping within ${FREE_SHIPPING_RADIUS_KM}km of Regina Avenue, Victoria`
        : `Shipping calculated based on ${Math.round(distance * 10) / 10}km distance`,
    });
  } catch (error: any) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate shipping fee',
        message: error.message || 'An error occurred',
      },
      { status: 500 }
    );
  }
}
