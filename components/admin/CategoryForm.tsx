'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiTag, FiFileText, FiSettings, FiSave, FiX } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import CategoryAttributes from './CategoryAttributes';
import { Category, CategoryAttribute } from '@/types/category';

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
  onUpdate?: (updatedCategory: Category) => void; // Callback to update parent state
}

export default function CategoryForm({
  category,
  onSuccess,
  onUpdate,
}: CategoryFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });
  const [attributes, setAttributes] = useState<CategoryAttribute[]>(
    category?.attributes || []
  );
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update form data and attributes when category prop changes (for async loading)
  useEffect(() => {
    if (category) {
      console.log('CategoryForm: Category prop changed, updating form');
      console.log('CategoryForm: Category attributes from prop:', JSON.stringify(category.attributes, null, 2));
      
      setFormData({
        name: category.name || '',
        description: category.description || '',
      });
      
      // Ensure attributes is always an array
      const categoryAttributes = category.attributes;
      if (Array.isArray(categoryAttributes) && categoryAttributes.length > 0) {
        console.log('CategoryForm: Setting attributes from category prop:', JSON.stringify(categoryAttributes, null, 2));
        setAttributes(categoryAttributes);
      } else {
        console.log('CategoryForm: No attributes in category prop, keeping current or setting empty');
        // Don't reset if we already have attributes (might be user input)
        if (attributes.length === 0) {
          setAttributes([]);
        }
      }
    } else {
      // Reset when category is cleared
      setAttributes([]);
    }
  }, [category?._id]); // Only trigger on category ID change, not on every attribute change

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const url = category
        ? `/api/admin/categories/${category._id}`
        : '/api/admin/categories';
      const method = category ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        attributes: attributes || [],
      };
      
      console.log('CategoryForm: Current attributes state:', attributes);
      console.log('CategoryForm: Submitting with attributes:', JSON.stringify(payload.attributes, null, 2));
      console.log('CategoryForm: Attributes count:', payload.attributes.length);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('CategoryForm: Response data:', data);
      console.log('CategoryForm: Response category:', JSON.stringify(data.category, null, 2));
      console.log('CategoryForm: Response category attributes:', JSON.stringify(data.category?.attributes, null, 2));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      // Show success message
      setSuccessMessage(
        category
          ? 'Category updated successfully!'
          : 'Category created successfully!'
      );
      setError('');

      // Handle both create and update responses
      if (data.category) {
        const responseCategory = data.category;
        const responseAttributes = responseCategory.attributes || [];
        
        console.log('CategoryForm: Response attributes:', JSON.stringify(responseAttributes, null, 2));
        console.log('CategoryForm: Response attributes count:', responseAttributes.length);
        console.log('CategoryForm: Current attributes before update:', JSON.stringify(attributes, null, 2));
        
        // Update form data and attributes with the response
        setFormData({
          name: responseCategory.name || '',
          description: responseCategory.description || '',
        });
        
        // Update attributes from response
        if (Array.isArray(responseAttributes) && responseAttributes.length > 0) {
          console.log('CategoryForm: Setting attributes from response:', JSON.stringify(responseAttributes, null, 2));
          setAttributes(responseAttributes);
        } else {
          console.warn('CategoryForm: Response has no attributes or empty array');
          // For new categories, keep the attributes that were submitted if response doesn't have them
          if (!category && attributes.length > 0) {
            console.log('CategoryForm: Keeping submitted attributes for new category');
          }
        }
        
        // Notify parent component of the update (for edit page)
        if (category && onUpdate) {
          onUpdate(responseCategory);
        }
      } else if (category && data.category) {
        // Legacy support for update response format
        const updatedCategory = data.category;
        const responseAttributes = updatedCategory.attributes || [];
        
        console.log('CategoryForm: Response attributes:', JSON.stringify(responseAttributes, null, 2));
        console.log('CategoryForm: Response attributes count:', responseAttributes.length);
        console.log('CategoryForm: Current attributes before update:', JSON.stringify(attributes, null, 2));
        
        // Update form data and attributes with the response
        setFormData({
          name: updatedCategory.name || '',
          description: updatedCategory.description || '',
        });
        
        // Only update attributes if response has attributes, otherwise keep current
        if (Array.isArray(responseAttributes) && responseAttributes.length > 0) {
          setAttributes(responseAttributes);
          console.log('CategoryForm: Updated attributes from response:', JSON.stringify(responseAttributes, null, 2));
        } else {
          console.warn('CategoryForm: Response has no attributes, keeping current attributes');
        }
        
        // Notify parent component of the update
        if (onUpdate) {
          onUpdate(updatedCategory);
        }
      }

      // For new categories, redirect to list page
      // For updates, stay on the page to show changes
      if (!category) {
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.push('/admin/categories');
            router.refresh();
          }
        }, 1500);
      } else {
        // For updates, just reset loading state after showing success message
        setIsLoading(false);
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
      setSuccessMessage('');
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: error || successMessage ? 1 : 0, y: 0 }}
        className="space-y-3"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Alert variant="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Alert variant="success" onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          </motion.div>
        )}
      </motion.div>

      {/* Basic Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-blue-50/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-blue-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <FiTag className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#000000]">Basic Information</h2>
          </div>
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Electronics, Clothing, Books"
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white"
              />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe what products belong to this category..."
                rows={4}
                className="border-2 border-gray-200 focus:border-[#F9629F] focus:ring-[#F9629F]/20 bg-white"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Attributes Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white to-purple-50/30 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border-2 border-purple-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <FiSettings className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#000000]">Category Attributes</h2>
          </div>
          <CategoryAttributes
            attributes={attributes}
            onChange={(newAttributes) => {
              console.log('CategoryForm: onChange called with', newAttributes.length, 'attributes');
              console.log('CategoryForm: New attributes:', JSON.stringify(newAttributes, null, 2));
              console.log('CategoryForm: Current attributes state before update:', JSON.stringify(attributes, null, 2));
              console.log('CategoryForm: Current attributes count:', attributes.length);
              // Use functional update to ensure we're working with latest state
              setAttributes((prevAttributes) => {
                console.log('CategoryForm: setAttributes functional update - prevAttributes:', JSON.stringify(prevAttributes, null, 2));
                console.log('CategoryForm: setAttributes functional update - newAttributes:', JSON.stringify(newAttributes, null, 2));
                return newAttributes;
              });
            }}
          />
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t-2 border-gray-200"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border border-gray-300 text-[#1a1a1a] bg-[#FDE8F0] hover:bg-[#FC9BC2] font-semibold px-6 py-3"
          >
            <FiX className="w-4 h-4 mr-2 inline" />
            Cancel
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="bg-gradient-to-r from-[#F9629F] to-[#DB7093] hover:from-[#DB7093] hover:to-[#F9629F] border-0 text-white font-semibold shadow-lg px-6 py-3"
          >
            {!isLoading && <FiSave className="w-4 h-4 mr-2 inline" />}
            {category ? 'Update Category' : 'Create Category'}
          </Button>
        </motion.div>
      </motion.div>
    </form>
  );
}

