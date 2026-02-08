'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/currency';
import Alert from '@/components/ui/Alert';
import ImageUpload from './ImageUpload';
import DynamicAttributes from './DynamicAttributes';
import { Product } from '@/types/product';
import { Category } from '@/types/category';

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    stock: product?.stock || 0,
    featured: product?.featured || false,
    isFlashSale: product?.isFlashSale || false,
    flashSaleDiscount: product?.flashSaleDiscount || 0,
    flashSaleDiscountType: product?.flashSaleDiscountType || 'percentage',
  });
  const [attributes, setAttributes] = useState<Record<string, any>>(
    product?.attributes || {}
  );
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [coverImage, setCoverImage] = useState<string>(
    product?.coverImage || product?.images?.[0] || ''
  );
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attributeErrors, setAttributeErrors] = useState<Record<string, string>>({});
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [previewDiscountedPrice, setPreviewDiscountedPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Calculate preview discounted price when discount or discount type changes
  // New logic: Displayed price = product.price, Crossed out price = price * (percentage/100) + price
  useEffect(() => {
    if (formData.isFlashSale && formData.flashSaleDiscount > 0 && formData.price) {
      const price = parseFloat(formData.price as string);
      if (!isNaN(price) && price > 0) {
        // Displayed price is always the product price
        // For preview, we calculate what the crossed-out price would be
        let crossedOutPrice: number;
        if (formData.flashSaleDiscountType === 'percentage') {
          // Crossed out price = price * percentage * price + price
          // Example: price=100, percentage=20 => 100 * (20/100) * 100 + 100 = 100 * 0.2 * 100 + 100 = 2000 + 100 = 2100
          // OR: price * (percentage/100) + price = price * (1 + percentage/100)
          // Let's use: price * (percentage/100) + price for now
          crossedOutPrice = price * (formData.flashSaleDiscount / 100) + price;
        } else {
          // For fixed amount, crossed out price = price + discount
          crossedOutPrice = price + formData.flashSaleDiscount;
        }
        // Store the crossed out price for display (we'll show price as displayed, crossedOutPrice as crossed out)
        setPreviewDiscountedPrice(crossedOutPrice);
      }
    } else if (!formData.isFlashSale || formData.flashSaleDiscount === 0) {
      setPreviewDiscountedPrice(null);
    }
  }, [formData.isFlashSale, formData.flashSaleDiscount, formData.flashSaleDiscountType, formData.price]);

  useEffect(() => {
    // Load category details when category is selected or product has category
    if (formData.category) {
      const category = categories.find(
        (cat) => cat._id === formData.category || cat.name === formData.category
      );
      setSelectedCategory(category || null);
    } else {
      setSelectedCategory(null);
    }
  }, [formData.category, categories]);

  useEffect(() => {
    // Initialize attributes when category is selected or changes
    if (selectedCategory) {
      if (product && product.attributes && product.category === formData.category) {
        // When editing, use existing product attributes if category matches
        setAttributes(product.attributes);
      } else {
        // When creating new or category changed, initialize with default values
        const newAttributes: Record<string, any> = {};
        selectedCategory.attributes?.forEach((attr) => {
          // Preserve existing value if attribute name matches, otherwise use default
          const existingValue = attributes[attr.name];
          if (existingValue !== undefined && existingValue !== '') {
            newAttributes[attr.name] = existingValue;
          } else {
            if (attr.type === 'boolean') {
              newAttributes[attr.name] = false;
            } else if (attr.type === 'number') {
              newAttributes[attr.name] = '';
            } else {
              newAttributes[attr.name] = '';
            }
          }
        });
        setAttributes(newAttributes);
      }
    } else {
      // Clear attributes when no category is selected
      setAttributes({});
    }
  }, [selectedCategory?._id, formData.category]);

  const fetchCategories = async () => {
    try {
      // Fetch from admin API to get attributes
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (images.length === 0) {
        setError('Please add at least one product image');
        setIsLoading(false);
        return;
      }

      if (!formData.category) {
        setError('Please select a category');
        setIsLoading(false);
        return;
      }

      const url = product
        ? `/api/admin/products/${product._id}`
        : '/api/admin/products';
      const method = product ? 'PUT' : 'POST';

      // Ensure coverImage is set (use first image if not set)
      const finalCoverImage = coverImage || images[0] || '';

      // Validate required attributes
      const validationErrors: Record<string, string> = {};
      if (selectedCategory?.attributes) {
        selectedCategory.attributes.forEach((attr) => {
          const value = attributes[attr.name];
          if (attr.required) {
            if (value === undefined || value === null || value === '') {
              validationErrors[attr.name] = `${attr.label || attr.name} is required`;
            } else if (attr.type === 'number' && isNaN(Number(value))) {
              validationErrors[attr.name] = `${attr.label || attr.name} must be a valid number`;
            }
          }
          // Additional validation for number type
          if (attr.type === 'number' && value !== '' && value !== undefined && value !== null) {
            const numValue = Number(value);
            if (isNaN(numValue)) {
              validationErrors[attr.name] = `${attr.label || attr.name} must be a valid number`;
            } else {
              if (attr.validation?.min !== undefined && numValue < attr.validation.min) {
                validationErrors[attr.name] = `${attr.label || attr.name} must be at least ${attr.validation.min}`;
              }
              if (attr.validation?.max !== undefined && numValue > attr.validation.max) {
                validationErrors[attr.name] = `${attr.label || attr.name} must be at most ${attr.validation.max}`;
              }
            }
          }
        });
      }

      if (Object.keys(validationErrors).length > 0) {
        setAttributeErrors(validationErrors);
        const errorMessages = Object.values(validationErrors).join(', ');
        setError(`Please fix the following errors: ${errorMessages}`);
        setIsLoading(false);
        return;
      }

      // Clear attribute errors if validation passes
      setAttributeErrors({});

      const requestBody: any = {
        ...formData,
        price: parseFloat(formData.price as string),
        stock: typeof formData.stock === 'string' ? parseInt(formData.stock) : formData.stock,
        images,
        coverImage: finalCoverImage,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        isFlashSale: formData.isFlashSale || false,
      };

      // Only include flash sale discount fields if flash sale is enabled
      if (formData.isFlashSale) {
        // Always send the actual discount value (even if 0) when flash sale is enabled
        const discountValue = typeof formData.flashSaleDiscount === 'number' 
          ? formData.flashSaleDiscount 
          : parseFloat(String(formData.flashSaleDiscount || 0));
        requestBody.flashSaleDiscount = discountValue;
        requestBody.flashSaleDiscountType = formData.flashSaleDiscountType || 'percentage';
      } else {
        // If disabling flash sale, clear the discount fields
        requestBody.flashSaleDiscount = 0;
        requestBody.flashSaleDiscountType = 'percentage';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      // Show success message
      setSuccessMessage(
        product
          ? 'Product updated successfully!'
          : 'Product created successfully!'
      );
      setError('');

      // Redirect after a short delay to show success message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/admin/products');
          router.refresh();
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
      setSuccessMessage('');
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const updatedFormData = {
      ...formData,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? value
          : value,
    };
    
    setFormData(updatedFormData);
    
    // Recalculate preview when price is directly edited
    if (name === 'price' && updatedFormData.isFlashSale && updatedFormData.flashSaleDiscount > 0) {
      const price = parseFloat(value);
      if (!isNaN(price) && price > 0) {
        let crossedOutPrice: number;
        if (updatedFormData.flashSaleDiscountType === 'percentage') {
          // Crossed out price = price * (percentage/100) + price
          crossedOutPrice = price * (updatedFormData.flashSaleDiscount / 100) + price;
        } else {
          // For fixed amount, crossed out price = price + discount
          crossedOutPrice = price + updatedFormData.flashSaleDiscount;
        }
        setPreviewDiscountedPrice(crossedOutPrice);
      }
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      setError('Please enter a product name first');
      return;
    }

    setGeneratingDescription(true);
    setError('');

    try {
      const categoryName = selectedCategory?.name || formData.category;
      
      const response = await fetch('/api/admin/products/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: formData.name,
          category: categoryName,
          attributes: attributes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate description');
      }

      if (data.description) {
        setFormData({
          ...formData,
          description: data.description,
        });
        setSuccessMessage('Description generated successfully! You can edit it if needed.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate description. Please try again.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...categories.map((cat) => {
      const attrCount = cat.attributes?.length || 0;
      const label = attrCount > 0 
        ? `${cat.name} (${attrCount} ${attrCount === 1 ? 'attribute' : 'attributes'})`
        : cat.name;
      return {
        value: cat._id || cat.name,
        label,
      };
    }),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert variant="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </motion.div>
      )}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert variant="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        </motion.div>
      )}

      {loadingCategories ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center gap-3 text-[#050b2c]">
            <div className="w-6 h-6 border-4 border-[#ffa509] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#050b2c] font-medium">Loading categories...</p>
          </div>
        </motion.div>
      ) : categories.length === 0 ? (
        <Alert variant="warning">
          No categories found. Please{' '}
          <a
            href="/admin/categories/create"
            className="text-[#ffa509] hover:text-[#ff8c00] font-semibold underline transition-colors"
          >
            create a category
          </a>{' '}
          first before adding products.
        </Alert>
      ) : null}

      {/* Product Name & Category Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="space-y-2">
          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter product name"
            className="bg-white border-2 border-gray-200 focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all text-[#050b2c] placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            options={categoryOptions}
            disabled={loadingCategories || categories.length === 0}
            className="bg-white border-2 border-gray-200 focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all text-[#050b2c]"
          />
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-4 bg-gradient-to-br from-[#ffa509]/10 to-[#ff8c00]/10 rounded-xl border border-[#ffa509]/20"
            >
              {selectedCategory.description && (
                <p className="mb-2 text-sm text-[#050b2c]/80">{selectedCategory.description}</p>
              )}
              {selectedCategory.attributes && selectedCategory.attributes.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs font-semibold text-[#050b2c]">
                    Attributes ({selectedCategory.attributes.length}):
                  </span>
                  {selectedCategory.attributes.slice(0, 5).map((attr, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white shadow-md"
                    >
                      {attr.label || attr.name}
                      {attr.required && <span className="ml-1 text-white">*</span>}
                    </motion.span>
                  ))}
                  {selectedCategory.attributes.length > 5 && (
                    <span className="text-xs text-[#050b2c]/60 font-medium">
                      +{selectedCategory.attributes.length - 5} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#050b2c]/60 mt-1">
                  No attributes defined for this category
                </p>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Description Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-[#050b2c]">
            Description
            <span className="text-[#ffa509] ml-1">*</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateDescription}
            isLoading={generatingDescription}
            disabled={!formData.name || generatingDescription || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all"
          >
            {generatingDescription ? 'Generating...' : '✨ Generate with AI'}
          </Button>
        </div>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Enter product description or click 'Generate with AI' to auto-generate"
          rows={4}
          className="bg-white border-2 border-gray-200 focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all resize-none text-[#050b2c] placeholder:text-gray-400"
        />
      </motion.div>

      {/* Price, Stock & Featured Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="space-y-2">
          <Input
            label="Price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="0.00"
            className="bg-white border-2 border-gray-200 focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all text-[#050b2c] placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Input
            label="Stock Quantity"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            required
            placeholder="0"
            className="bg-white border-2 border-gray-200 focus:border-[#ffa509] focus:ring-2 focus:ring-[#ffa509]/20 transition-all text-[#050b2c] placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center pt-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="h-5 w-5 text-[#ffa509] focus:ring-[#ffa509] border-2 border-gray-300 rounded transition-all cursor-pointer group-hover:border-[#ffa509]"
            />
            <span className="block text-sm font-semibold text-[#050b2c] group-hover:text-[#ffa509] transition-colors">
              Featured Product
            </span>
          </label>
        </div>

        <div className="flex items-center pt-8">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="isFlashSale"
              name="isFlashSale"
              checked={formData.isFlashSale}
              onChange={(e) =>
                setFormData({ ...formData, isFlashSale: e.target.checked })
              }
              className="h-5 w-5 text-[#ffa509] focus:ring-[#ffa509] border-2 border-gray-300 rounded transition-all cursor-pointer group-hover:border-[#ffa509]"
            />
            <span className="block text-sm font-semibold text-[#050b2c] group-hover:text-[#ffa509] transition-colors">
              Enable Flash Sale
            </span>
          </label>
        </div>
      </motion.div>

      {/* Flash Sale Section */}
      {formData.isFlashSale && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border-2 border-red-200"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#050b2c]">
                  Discount Type
                </label>
                <select
                  name="flashSaleDiscountType"
                  value={formData.flashSaleDiscountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      flashSaleDiscountType: e.target.value as 'percentage' | 'fixed',
                    })
                  }
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-[#050b2c]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Input
                  label={
                    formData.flashSaleDiscountType === 'percentage'
                      ? 'Discount Percentage'
                      : 'Discount Amount ($)'
                  }
                  name="flashSaleDiscount"
                  type="number"
                  step={formData.flashSaleDiscountType === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={formData.flashSaleDiscountType === 'percentage' ? '100' : undefined}
                  value={formData.flashSaleDiscount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      flashSaleDiscount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder={
                    formData.flashSaleDiscountType === 'percentage'
                      ? 'e.g., 20'
                      : 'e.g., 10.00'
                  }
                  className="bg-white border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-[#050b2c] placeholder:text-gray-400"
                />
                {formData.flashSaleDiscount > 0 && formData.price && previewDiscountedPrice !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 p-3 bg-white rounded-lg border border-red-200"
                  >
                    <p className="text-xs text-gray-600 mb-2 font-semibold">Preview:</p>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-lg font-bold text-red-500">
                        {formatCurrency(parseFloat(formData.price as string))}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(previewDiscountedPrice)}
                      </span>
                      {formData.flashSaleDiscountType === 'fixed' && parseFloat(formData.price as string) > 0 && (
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          ({((formData.flashSaleDiscount / parseFloat(formData.price as string)) * 100).toFixed(1)}% off)
                        </span>
                      )}
                      {formData.flashSaleDiscountType === 'percentage' && (
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          ({formData.flashSaleDiscount}% off)
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      <ImageUpload
        images={images}
        coverImage={coverImage}
        onImagesChange={setImages}
        onCoverImageChange={setCoverImage}
      />

      {/* Dynamic Attributes */}
      {selectedCategory?.attributes && selectedCategory.attributes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-t-2 border-gradient-to-r from-[#ffa509] to-[#ff8c00] pt-8 mt-8"
        >
          <div className="mb-6 p-4 bg-gradient-to-r from-[#ffa509]/10 to-[#ff8c00]/10 rounded-xl border border-[#ffa509]/20">
            <h3 className="text-xl font-bold text-[#050b2c] mb-2 flex items-center gap-2">
              <span className="p-2 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] rounded-lg text-white text-sm">
                ⚙️
              </span>
              Category Attributes
            </h3>
            <p className="text-sm text-[#050b2c]/70">
              Fill in the attributes specific to the <strong className="text-[#ffa509]">{selectedCategory.name}</strong> category.
              {selectedCategory.attributes.filter(attr => attr.required).length > 0 && (
                <span className="text-[#ffa509] ml-1 font-semibold">
                  * Required fields
                </span>
              )}
            </p>
          </div>
          <DynamicAttributes
            attributes={selectedCategory.attributes}
            values={attributes}
            onChange={(name, value) => {
              setAttributes((prev) => ({
                ...prev,
                [name]: value,
              }));
              // Clear error for this field when user starts typing
              if (attributeErrors[name]) {
                setAttributeErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors[name];
                  return newErrors;
                });
              }
            }}
            errors={attributeErrors}
          />
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t-2 border-gray-200"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-2 border-gray-300 text-[#050b2c] hover:bg-gray-50 hover:border-[#ffa509] transition-all font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={loadingCategories || categories.length === 0}
          className="bg-gradient-to-r from-[#ffa509] to-[#ff8c00] text-white border-none hover:from-[#ff8c00] hover:to-[#ffa509] shadow-lg hover:shadow-xl transition-all font-semibold px-8"
        >
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </motion.div>
    </form>
  );
}
