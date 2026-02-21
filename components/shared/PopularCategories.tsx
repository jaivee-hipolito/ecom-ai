'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiPackage,
  FiGrid,
  FiStar,
} from 'react-icons/fi';

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

/** Optional: products with category + coverImage to show one image per category */
interface ProductWithCategory {
  category: string;
  coverImage?: string;
}

interface PopularCategoriesProps {
  categories: Category[];
  products?: ProductWithCategory[];
}

// Simple icon for category (jewelry-style: use star/grid/package as fallback)
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('new') || name.includes('arrival')) return FiStar;
  if (name.includes('diamond')) return FiStar;
  if (name.includes('gold') || name.includes('karat') || name.includes('22') || name.includes('18')) return FiGrid;
  return FiPackage;
};

/** Get cover image URL for a category (first product in that category) */
function getCategoryImageUrl(categoryName: string, products?: ProductWithCategory[]): string | null {
  if (!products?.length) return null;
  const p = products.find((pr) => (pr.category || '').trim() === (categoryName || '').trim());
  return p?.coverImage && p.coverImage.trim() ? p.coverImage : null;
}

export default function PopularCategories({ categories, products = [] }: PopularCategoriesProps) {
  if (categories.length === 0) {
    return null;
  }

  // Show first 4 categories in 2x2 grid (like the image)
  const displayCategories = categories.slice(0, 4);

  return (
    <div className="bg-white py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title: "Collections" - top-left, elegant serif */}
        <motion.h2
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-2xl lg:text-3xl font-serif text-[#000000] mb-6 lg:mb-8"
        >
          Curated Selections
        </motion.h2>

        {/* 2x2 grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-6">
          {displayCategories.map((category, index) => {
            const Icon = getCategoryIcon(category.name);
            const linkLabel = `${category.name} Collections`;
            const href = `/products?category=${encodeURIComponent(category.name)}`;
            const imageUrl = getCategoryImageUrl(category.name, products);

            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="group"
              >
                <Link href={href} className="block">
                  {/* Card: rounded corners, thin gold/brown border */}
                  <div className="rounded-lg border-2 border-[#c9a227]/40 overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-shadow">
                    {/* Image area: real image or gradient placeholder */}
                    <div className="relative aspect-[4/3] sm:aspect-[3/2] bg-gradient-to-br from-white via-gray-50/50 to-amber-50/30 overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                          unoptimized={imageUrl.startsWith('http') || imageUrl.startsWith('//')}
                        />
                      ) : (
                        <>
                          {/* Subtle diagonal gold lines - top right */}
                          <div
                            className="absolute top-0 right-0 w-1/2 h-1/2 opacity-30"
                            style={{
                              backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 8px,
                                rgba(201, 162, 39, 0.15) 8px,
                                rgba(201, 162, 39, 0.15) 10px
                              )`,
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Icon className="w-12 h-12 sm:w-14 sm:h-14 text-[#c9a227]/20" />
                          </div>
                        </>
                      )}
                      {/* Corner brackets - 4 white L-shapes */}
                      <div className="absolute top-2 left-2 w-5 h-5 border-l-2 border-t-2 border-white rounded-tl pointer-events-none z-10" />
                      <div className="absolute top-2 right-2 w-5 h-5 border-r-2 border-t-2 border-white rounded-tr pointer-events-none z-10" />
                      <div className="absolute bottom-2 left-2 w-5 h-5 border-l-2 border-b-2 border-white rounded-bl pointer-events-none z-10" />
                      <div className="absolute bottom-2 right-2 w-5 h-5 border-r-2 border-b-2 border-white rounded-br pointer-events-none z-10" />
                      {/* Semi-transparent beige band + category name */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 py-2.5 bg-[#f5f0e6]/90 backdrop-blur-[1px] z-10">
                        <span className="block text-center font-semibold text-sm sm:text-base uppercase tracking-wide text-[#6b5b3a]">
                          {category.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Link below card */}
                  <p className="mt-2 text-sm text-gray-700 group-hover:text-[#000000] transition-colors flex items-center gap-1">
                    <span>{linkLabel}</span>
                    <span className="text-[#000000]">→</span>
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
