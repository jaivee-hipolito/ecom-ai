'use client';

import { useState, useEffect } from 'react';
import { useProductSearch } from '@/hooks/useProducts';
import Link from 'next/link';
import { IProduct } from '@/types/product';

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, isLoading } = useProductSearch(query);

  useEffect(() => {
    setIsOpen(query.length > 0 && results.length > 0);
  }, [query, results]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(query.length > 0 && results.length > 0)}
          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-all shadow-sm hover:shadow-md"
        />
        <svg
          className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No products found
            </div>
          ) : (
            <div className="py-2">
              {results.map((product: IProduct) => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  onClick={() => {
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="block px-4 py-3 hover:bg-[#ffa509]/10 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 relative flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      {(() => {
                        const imageUrl = product.coverImage || (product.images && product.images[0]);
                        const isPlaceholder = !imageUrl || imageUrl.includes('example.com') || imageUrl.startsWith('http://localhost');
                        
                        return isPlaceholder ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        ) : (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.placeholder-icon')) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'w-full h-full flex items-center justify-center placeholder-icon';
                                placeholder.innerHTML = `
                                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                `;
                                parent.appendChild(placeholder);
                              }
                            }}
                          />
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
