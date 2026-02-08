'use client';

import { CategoryAttribute } from '@/types/category';
import ColorSwatch from './ColorSwatch';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle, FiFileText, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';

interface ProductAttributesProps {
  attributes: Record<string, any>;
  categoryAttributes?: CategoryAttribute[];
}

export default function ProductAttributes({
  attributes,
  categoryAttributes = [],
}: ProductAttributesProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  if (!attributes || Object.keys(attributes).length === 0) {
    return null;
  }

  // Create a map of attribute definitions for quick lookup
  const attributeMap = new Map(
    categoryAttributes.map((attr) => [attr.name, attr])
  );

  // Helper function to check if a value is valid (not null, undefined, or empty)
  const isValidValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  };

  // Filter out invalid attributes and view-related attributes
  const validAttributes = Object.entries(attributes).filter(([key, value]) => {
    // Filter out view-related attributes (case-insensitive)
    const keyLower = key.toLowerCase();
    if (keyLower.includes('view') || keyLower.includes('views') || keyLower.includes('viewcount') || keyLower.includes('view_count')) {
      return false;
    }
    return isValidValue(value);
  });

  // If no valid attributes, don't render the component
  if (validAttributes.length === 0) {
    return null;
  }

  // Helper function to format value for specification display (simple text)
  const formatValueForSpec = (key: string, value: any): string => {
    // Handle color attributes - just return the color name(s)
    if (
      (key.toLowerCase().includes('color') ||
        key.toLowerCase().includes('colour')) &&
      typeof value === 'string'
    ) {
      return value;
    }

    // Handle boolean attributes
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle array values - join with comma
    if (Array.isArray(value)) {
      return value.map((item) => String(item)).join(', ');
    }

    // Default: return as string
    return String(value);
  };

  // Helper function to format attribute value (for other uses)
  const formatValue = (key: string, value: any): React.ReactNode => {
    const attrDef = attributeMap.get(key);
    const label = attrDef?.label || key;

    // Handle color attributes with swatches
    if (
      (key.toLowerCase().includes('color') ||
        key.toLowerCase().includes('colour')) &&
      typeof value === 'string'
    ) {
      // If value is a single color
      if (!value.includes(',')) {
        return (
          <div className="flex items-center space-x-3">
            <ColorSwatch color={value} size="md" />
            <span className="text-base font-medium text-[#050b2c] capitalize">{value}</span>
          </div>
        );
      }
      // If value is multiple colors (comma-separated)
      const colors = value.split(',').map((c: string) => c.trim());
      return (
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-2">
            {colors.map((color, index) => (
              <ColorSwatch key={index} color={color} size="sm" />
            ))}
          </div>
          <span className="text-base font-medium text-[#050b2c]">{colors.join(', ')}</span>
        </div>
      );
    }

    // Handle boolean attributes
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-base font-semibold text-green-600">Yes</span>
            </>
          ) : (
            <>
              <FiXCircle className="w-5 h-5 text-gray-400" />
              <span className="text-base font-medium text-gray-400">No</span>
            </>
          )}
        </div>
      );
    }

    // Handle array values
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="px-3 py-1.5 bg-gradient-to-r from-[#ffa509]/10 to-[#ffa509]/5 border border-[#ffa509]/30 text-[#050b2c] rounded-lg text-sm font-medium hover:from-[#ffa509]/20 hover:to-[#ffa509]/10 transition-all"
            >
              {String(item)}
            </motion.span>
          ))}
        </div>
      );
    }

    // Default: display as string
    return (
      <span className="text-base font-medium text-[#050b2c]">
        {String(value)}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8 pt-8 border-t-2 border-gray-200"
    >
      {/* Header Section */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="p-2 bg-gradient-to-br from-[#050b2c] to-[#0a1a4a] rounded-lg">
            <FiInfo className="w-5 h-5 text-[#ffa509]" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-[#050b2c]">
            Product Specifications
          </h3>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-600 ml-12"
        >
          Detailed information about this product
        </motion.p>
      </div>

      {/* Specifications List - Vertical, Left-Aligned */}
      <div className="space-y-3 mb-8">
        {validAttributes.map(([key, value], index) => {
          const attrDef = attributeMap.get(key);
          const label = attrDef?.label || key.replace(/([A-Z])/g, ' $1').trim();

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="text-base leading-relaxed"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              <span className="font-bold text-[#333333]">{label}:</span>
              <span className="text-[#333333] ml-1">{formatValueForSpec(key, value)}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Important Information Section - Accordion Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 pt-8 border-t-2 border-gray-200"
      >
        <div className="bg-white">
          {/* Main Heading - Yellow Alert Box */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-6">
            <h4 className="text-base leading-tight font-sans">
              <span className="font-bold text-red-600 uppercase">IMPORTANT:</span>
              <br />
              <span className="text-[#333333] uppercase font-bold">PLEASE REVIEW BEFORE COMPLETING YOUR PURCHASE.</span>
            </h4>
          </div>

          {/* Collapsible Sections */}
          <div className="space-y-3">
            {/* Caution about Lightweight Gold Jewelry */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('lightweight')}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <FiFileText className="w-5 h-5 text-gray-700 flex-shrink-0" />
                <span className="flex-1 text-sm font-medium text-[#333333]">
                  Caution about Lightweight Gold Jewelry
                </span>
                <motion.div
                  animate={{ rotate: expandedSections.has('lightweight') ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown className="w-5 h-5 text-gray-700 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSections.has('lightweight') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-12 text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                      We kindly inform our valued customers that our lightweight gold jewelry, while elegantly sophisticated, is more delicate than heavier pieces and may be more prone to breakage. Please handle with care to ensure longevity. Jewelry weighing less than 5 grams is considered lightweight.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Things to consider */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('considerations')}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <FiFileText className="w-5 h-5 text-gray-700 flex-shrink-0" />
                <span className="flex-1 text-sm font-medium text-[#333333]">
                  Things to consider before making a purchase
                </span>
                <motion.div
                  animate={{ rotate: expandedSections.has('considerations') ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown className="w-5 h-5 text-gray-700 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedSections.has('considerations') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-12 text-sm text-gray-700 leading-relaxed space-y-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                      <p>
                        Product images may appear larger than actual size due to photography and display settings. Please review all size details carefully before purchasing. All items are sold individually and are not priced by weight or gram.
                      </p>
                      <p>
                        All sales are final. We do not offer returns or exchanges, so we kindly ask that you confirm sizing prior to placing your order. If you are unsure, please consult our Jewelry Sizing Guide located in the resources section at the bottom of this page, or contact us directly for assistance before purchasing.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

