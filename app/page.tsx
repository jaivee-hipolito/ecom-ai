'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Loading from '@/components/ui/Loading';
import HeroCarousel from '@/components/shared/HeroCarousel';
import PopularCategories from '@/components/shared/PopularCategories';
import DealOfTheDay from '@/components/shared/DealOfTheDay';
import DiscountCodes from '@/components/shared/DiscountCodes';
import FlashSales from '@/components/shared/FlashSales';
import MostViewedProducts from '@/components/shared/MostViewedProducts';
import Footer from '@/components/shared/Footer';
import { useProducts } from '@/hooks/useProducts';

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

export default function Home() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  
  const { products, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 20, // Fetch more products to ensure we have enough for carousel
    autoFetch: true, // Fetch for all users
  });
  
  // Fetch featured products for carousel
  const { products: featuredProducts } = useProducts({
    filters: { featured: true },
    page: 1,
    limit: 5,
    autoFetch: true, // Fetch for all users
  });

  // Fetch categories for all users
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        {isAuthenticated && <DashboardSidebar />}
        <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64 pt-16 lg:pt-0' : ''} overflow-x-hidden`}>
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading size="lg" text="Loading..." />
          </div>
        </div>
      </div>
    );
  }

  // Show landing page with products for all users
  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {isAuthenticated && <DashboardSidebar />}
      <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64 pt-16 lg:pt-0' : ''} overflow-x-hidden`}>
        <Navbar />
        <main>
          {/* Hero Carousel Section */}
          {productsLoading ? (
            <div className="h-[500px] lg:h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <Loading size="lg" text="Loading featured products..." />
            </div>
          ) : (() => {
            // Combine featured and regular products, ensuring at least 3 products
            const allProducts = [...featuredProducts];
            
            // Add regular products that aren't already in featured list
            const regularProducts = products.filter(
              (p) => !allProducts.some((fp) => fp._id === p._id) && p.stock > 0
            );
            allProducts.push(...regularProducts);
            
            // Ensure we have at least 3 products, but show all available if less than 3
            const carouselProducts = allProducts.length >= 3 
              ? allProducts.slice(0, Math.min(5, allProducts.length))
              : allProducts;
            
            return carouselProducts.length >= 3 ? (
              <HeroCarousel products={carouselProducts} />
            ) : carouselProducts.length > 0 ? (
              <HeroCarousel products={carouselProducts} />
            ) : null;
          })()}

          {/* Popular Categories Section */}
          {categories.length > 0 && (
            <PopularCategories categories={categories} />
          )}

          {/* Deal of the Day Section */}
          {!productsLoading && (
            <DealOfTheDay initialProducts={products} />
          )}

          {/* Discount Codes Section */}
          <DiscountCodes />

          {/* Flash Sales Section */}
          {!productsLoading && (
            <FlashSales initialProducts={products} />
          )}

          {/* Most Viewed Products Section */}
          {!productsLoading && (
            <MostViewedProducts initialProducts={products} />
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
