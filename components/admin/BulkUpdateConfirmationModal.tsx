'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface BulkUpdateConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  updates: {
    price?: string;
    category?: string;
    stock?: string;
    featured?: string;
  };
  categoryName?: string;
  isLoading?: boolean;
}

export default function BulkUpdateConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  updates,
  categoryName,
  isLoading = false,
}: BulkUpdateConfirmationModalProps) {
  const updateFields = [];
  if (updates.price && updates.price.trim() !== '') {
    updateFields.push(`Price: $${parseFloat(updates.price).toFixed(2)}`);
  }
  if (updates.category && updates.category.trim() !== '') {
    updateFields.push(`Category: ${categoryName || updates.category}`);
  }
  if (updates.stock && updates.stock.trim() !== '') {
    updateFields.push(`Stock: ${updates.stock}`);
  }
  if (updates.featured && updates.featured.trim() !== '') {
    updateFields.push(
      updates.featured === 'true' ? 'Featured: Yes' : 'Featured: No'
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Bulk Update" size="md">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              You are about to update <strong>{selectedCount}</strong> product(s) with the following changes:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-3">
              {updateFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
            <p className="text-sm text-yellow-600 font-medium">
              This action will update all selected products. Please review carefully.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Confirm Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}

