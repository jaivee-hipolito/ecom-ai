'use client';

import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiPackage, FiTruck, FiXCircle } from 'react-icons/fi';

interface OrderTrackingProps {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: FiClock },
  { key: 'processing', label: 'Processing', icon: FiPackage },
  { key: 'shipped', label: 'Shipped', icon: FiTruck },
  { key: 'delivered', label: 'Delivered', icon: FiCheckCircle },
];

export default function OrderTracking({ status }: OrderTrackingProps) {
  const getStatusIndex = () => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex();

  if (status === 'cancelled') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 text-red-600">
          <FiXCircle className="w-6 h-6" />
          <h2 className="text-xl font-bold">Order Cancelled</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-[#000000] mb-6">Order Tracking</h2>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-[#F9629F] to-[#DB7093]"
          />
        </div>

        {/* Status Steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-gradient-to-br from-[#F9629F] to-[#DB7093] text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-[#F9629F]/30' : ''}`}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={`mt-3 text-xs sm:text-sm font-medium text-center ${
                    isCompleted ? 'text-[#000000]' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </motion.p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
