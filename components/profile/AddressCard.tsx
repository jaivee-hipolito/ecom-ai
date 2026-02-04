'use client';

import { IAddress } from '@/types/address';
import Button from '@/components/ui/Button';
import { useState } from 'react';

interface AddressCardProps {
  address: IAddress;
  onEdit: (address: IAddress) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
  isDeleting?: boolean;
  isSettingDefault?: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting = false,
  isSettingDefault = false,
}: AddressCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleDelete = () => {
    if (isConfirmingDelete) {
      onDelete(address._id!);
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
      {address.isDefault && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Default Address
          </span>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{address.fullName}</h3>
        <p className="text-sm text-gray-600">{address.address}</p>
        <p className="text-sm text-gray-600">
          {address.city}, {address.state} {address.zipCode}
        </p>
        <p className="text-sm text-gray-600">{address.country}</p>
        <p className="text-sm text-gray-600">Phone: {address.phone}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {!address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(address._id!)}
            disabled={isDeleting || isSettingDefault}
          >
            {isSettingDefault ? 'Setting...' : 'Set as Default'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(address)}
          disabled={isDeleting}
        >
          Edit
        </Button>
        {isConfirmingDelete ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Confirm Delete
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
