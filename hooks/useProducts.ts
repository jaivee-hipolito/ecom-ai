'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { IProduct, ProductFilters, ProductListResponse } from '@/types/product';

interface UseProductsOptions {
  filters?: ProductFilters;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { filters: filtersOption = {}, page = 1, limit = 12, autoFetch = true } = options;
  
  // Memoize filters to prevent unnecessary re-renders
  // Serialize filters to detect actual value changes, not just reference changes
  const filtersKey = useMemo(
    () => JSON.stringify(filtersOption),
    [
      filtersOption.category,
      filtersOption.minPrice,
      filtersOption.maxPrice,
      filtersOption.featured,
      filtersOption.isFlashSale,
      filtersOption.search,
    ]
  );
  const filters = useMemo(() => filtersOption, [filtersKey]);

  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });

  // Create a serialized key for the current query to prevent duplicate requests
  const queryKey = useMemo(
    () => JSON.stringify({ filters, page, limit }),
    [filters, page, limit]
  );
  const lastQueryKeyRef = useRef<string>('');

  useEffect(() => {
    if (!autoFetch) return;
    
    // Prevent duplicate requests with the same query key
    if (lastQueryKeyRef.current === queryKey) {
      return;
    }
    
    lastQueryKeyRef.current = queryKey;
    
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice !== undefined)
          params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined)
          params.append('maxPrice', filters.maxPrice.toString());
        if (filters.featured !== undefined)
          params.append('featured', filters.featured.toString());
        if (filters.isFlashSale !== undefined)
          params.append('isFlashSale', filters.isFlashSale.toString());
        if (filters.search) params.append('search', filters.search);

        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data: ProductListResponse = await response.json();
        setProducts(data.products);
        setPagination({
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
        setProducts([]);
        lastQueryKeyRef.current = ''; // Reset on error to allow retry
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, autoFetch]); // queryKey already includes filters, page, limit

  const fetchProducts = useCallback(async () => {
    lastQueryKeyRef.current = ''; // Reset to allow manual refetch
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice !== undefined)
      params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined)
      params.append('maxPrice', filters.maxPrice.toString());
    if (filters.featured !== undefined)
      params.append('featured', filters.featured.toString());
    if (filters.isFlashSale !== undefined)
      params.append('isFlashSale', filters.isFlashSale.toString());
    if (filters.search) params.append('search', filters.search);

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ProductListResponse = await response.json();
      setProducts(data.products);
      setPagination({
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, limit]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    pagination,
    refetch,
  };
}

export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('useProduct - Fetching product:', productId);
      const response = await fetch(`/api/products/${productId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('useProduct - API error:', response.status, errorData);
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(errorData.error || 'Failed to fetch product');
      }

      const data = await response.json();
      console.log('useProduct - Product fetched:', data._id);
      setProduct(data);
    } catch (err: any) {
      console.error('useProduct - Error:', err);
      setError(err.message || 'Failed to fetch product');
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refetch: fetchProduct,
  };
}

export function useProductSearch(query: string) {
  const [results, setResults] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error('Failed to search products');
      }

      const data = await response.json();
      setResults(data.products || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search products');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [search]);

  return {
    results,
    isLoading,
    error,
  };
}
