import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  const baseStyles =
    'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
