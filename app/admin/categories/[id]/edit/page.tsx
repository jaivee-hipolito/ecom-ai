'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';
import Alert from '@/components/ui/Alert';
import { Category } from '@/types/category';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    if (!categoryId) {
      setError('Category ID is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch category');
      }

      setCategory(data);
    } catch (err: any) {
      console.error('Error fetching category:', err);
      setError(err.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    // Refresh category data after successful update
    fetchCategory();
  };

  const handleCategoryUpdate = (updatedCategory: Category) => {
    // Update local state with the updated category data
    setCategory(updatedCategory);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="error">
          {error || 'Category not found'}
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="mt-2 text-gray-600">
          Update category information
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <CategoryForm 
          category={category} 
          onSuccess={handleSuccess}
          onUpdate={handleCategoryUpdate}
        />
      </div>
    </div>
  );
}

