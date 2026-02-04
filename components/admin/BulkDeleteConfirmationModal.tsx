'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface BulkDeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isLoading?: boolean;
}

export default function BulkDeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isLoading = false,
}: BulkDeleteConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Bulk Delete" size="md">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              You are about to delete <strong>{selectedCount}</strong> product(s).
            </p>
            <p className="text-sm text-red-600 font-medium mb-3">
              This action cannot be undone. All product images will also be deleted from Cloudinary.
            </p>
            <p className="text-sm text-gray-500">
              Are you sure you want to proceed?
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Delete {selectedCount} Product(s)
          </Button>
        </div>
      </div>
    </Modal>
  );
}

