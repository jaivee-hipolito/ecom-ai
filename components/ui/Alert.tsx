import { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
  onClose?: () => void;
}

export default function Alert({
  children,
  variant = 'info',
  className = '',
  onClose,
}: AlertProps) {
  const variants = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={`p-4 rounded-lg border ${variants[variant]} ${className} relative`}
      role="alert"
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-current opacity-70 hover:opacity-100"
          aria-label="Close alert"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      {children}
    </div>
  );
}
