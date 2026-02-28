'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiTag } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { CategoryAttribute } from '@/types/category';

interface CategoryAttributesProps {
  attributes: CategoryAttribute[];
  onChange: (attributes: CategoryAttribute[]) => void;
}

export default function CategoryAttributes({
  attributes = [],
  onChange,
}: CategoryAttributesProps) {
  // Ensure attributes is always an array
  const safeAttributes = Array.isArray(attributes) ? attributes : [];
  
  // Debug: Log attributes prop changes
  useEffect(() => {
    console.log('CategoryAttributes: Attributes prop changed:', JSON.stringify(attributes, null, 2));
    console.log('CategoryAttributes: safeAttributes:', JSON.stringify(safeAttributes, null, 2));
  }, [attributes]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<CategoryAttribute>>({
    name: '',
    type: 'text',
    required: false,
    options: [],
  });
  /** Display value for Attribute Name (with spaces); normalized to name (underscores) on save */
  const [nameInput, setNameInput] = useState('');
  const [optionInput, setOptionInput] = useState('');

  const handleAdd = () => {
    const trimmed = nameInput.trim();
    if (!trimmed || !formData.type) {
      return;
    }
    // Normalize name: lowercase, spaces -> underscores (for storage)
    const name = trimmed.toLowerCase().replace(/\s+/g, '_');
    // Label: capitalize first letter of each word
    const label = trimmed
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const newAttribute: CategoryAttribute = {
      name,
      label,
      type: formData.type as CategoryAttribute['type'],
      required: formData.required || false,
      options: (formData.type === 'select' || formData.type === 'multiselect') ? (formData.options || []) : undefined,
      validation: formData.validation,
    };

    console.log('CategoryAttributes: Adding new attribute:', newAttribute);
    console.log('CategoryAttributes: Current attributes before add:', safeAttributes);

    if (editingIndex !== null) {
      const updated = [...safeAttributes];
      updated[editingIndex] = newAttribute;
      console.log('CategoryAttributes: Updating attribute at index', editingIndex, ':', updated);
      onChange(updated);
      setEditingIndex(null);
    } else {
      // Use functional update to ensure we have the latest attributes
      const currentAttributes = Array.isArray(attributes) ? attributes : [];
      const newAttributes = [...currentAttributes, newAttribute];
      console.log('CategoryAttributes: Current attributes from prop:', JSON.stringify(currentAttributes, null, 2));
      console.log('CategoryAttributes: New attribute being added:', JSON.stringify(newAttribute, null, 2));
      console.log('CategoryAttributes: New attributes array after add:', JSON.stringify(newAttributes, null, 2));
      console.log('CategoryAttributes: Calling onChange with', newAttributes.length, 'attributes');
      onChange(newAttributes);
    }

    setFormData({
      name: '',
      type: 'text',
      required: false,
      options: [],
    });
    setNameInput('');
    setShowAddForm(false);
    setOptionInput('');
  };

  const handleEdit = (index: number) => {
    const attr = safeAttributes[index];
    setFormData({
      name: attr.name,
      type: attr.type,
      required: attr.required,
      options: attr.options || [],
      validation: attr.validation,
    });
    // Show label (with spaces) in the name field when editing
    setNameInput(attr.label || attr.name.replace(/_/g, ' '));
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleDelete = (index: number) => {
    const updated = safeAttributes.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setFormData({
        ...formData,
        options: [...(formData.options || []), optionInput.trim()],
      });
      setOptionInput('');
    }
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = formData.options?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, options: updatedOptions });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <FiTag className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-[#000000]">
            Attributes <span className="text-[#F9629F]">({safeAttributes.length})</span>
          </h3>
        </div>
        {!showAddForm && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingIndex(null);
                setFormData({ name: '', type: 'text', required: false, options: [] });
                setNameInput('');
                setShowAddForm(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 text-white font-semibold shadow-lg"
            >
              <FiPlus className="w-4 h-4 mr-2 inline" />
              Add Attribute
            </Button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.01 }}>
                  <Input
                    label="Attribute Name"
                    placeholder="e.g., brand, size, type of beads"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <Select
                    label="Type"
                    value={formData.type || 'text'}
                    onChange={(e) => {
                      const type = e.target.value as CategoryAttribute['type'];
                      setFormData({
                        ...formData,
                        type,
                        options: (type === 'select' || type === 'multiselect') ? formData.options : undefined,
                      });
                    }}
                    options={[
                      { value: 'text', label: 'Text' },
                      { value: 'number', label: 'Number' },
                      { value: 'textarea', label: 'Textarea' },
                      { value: 'select', label: 'Select (Dropdown)' },
                      { value: 'multiselect', label: 'Multi-select' },
                      { value: 'boolean', label: 'Boolean (Checkbox)' },
                      { value: 'date', label: 'Date' },
                    ]}
                    required
                    className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white"
                  />
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center p-3 bg-white rounded-lg border-2 border-purple-200"
              >
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required || false}
                  onChange={(e) =>
                    setFormData({ ...formData, required: e.target.checked })
                  }
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="required" className="ml-3 block text-sm font-semibold text-[#000000] cursor-pointer">
                  This attribute is required
                </label>
              </motion.div>

              {(formData.type === 'select' || formData.type === 'multiselect') && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 bg-white p-4 rounded-lg border-2 border-purple-200"
                >
                  <label className="block text-sm font-semibold text-[#000000]">
                    Options {formData.type === 'multiselect' && '(e.g. 6, 7, 8 for size)'}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add option"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddOption}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 text-white font-semibold"
                      >
                        <FiPlus className="w-4 h-4 mr-1 inline" />
                        Add
                      </Button>
                    </motion.div>
                  </div>
                  {formData.options && formData.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.options.map((option, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-2 border-purple-200"
                        >
                          {option}
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="hover:bg-purple-200 rounded-full p-1 transition-colors"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingIndex(null);
                      setFormData({
                        name: '',
                        type: 'text',
                        required: false,
                        options: [],
                      });
                      setNameInput('');
                    }}
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold"
                  >
                    <FiX className="w-4 h-4 mr-2 inline" />
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleAdd}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 text-white font-semibold shadow-lg"
                  >
                    <FiCheck className="w-4 h-4 mr-2 inline" />
                    {editingIndex !== null ? 'Update' : 'Add'} Attribute
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {safeAttributes.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence>
            {safeAttributes.map((attr, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-center justify-between p-4 bg-gradient-to-br from-white to-purple-50/50 border-2 border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <FiTag className="w-3 h-3 text-white" />
                    </div>
                    <div className="font-bold text-[#000000]">{attr.label}</div>
                    {attr.required && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 ml-7">
                    <span className="font-medium">{attr.name}</span> • <span className="capitalize">{attr.type === 'multiselect' ? 'Multi-select' : attr.type}</span>
                    {attr.options && attr.options.length > 0 && (
                      <span className="ml-2 text-purple-600">
                        ({attr.options.join(', ')})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(index)}
                      className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 text-white font-semibold"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {safeAttributes.length === 0 && !showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl border-2 border-dashed border-gray-300"
        >
          <div className="inline-block p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-3">
            <FiTag className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-sm font-semibold text-gray-600">
            No attributes defined yet
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Click "Add Attribute" to define custom fields for products in this category
          </p>
        </motion.div>
      )}
    </div>
  );
}

