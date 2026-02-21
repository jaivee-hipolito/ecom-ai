import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery – Teezee',
};

export default function ShippingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
