'use client';

import HomePageContent from '@/components/shared/HomePageContent';

/**
 * Admin view of the customer home page (same content as /).
 * Renders inside the admin layout (sidebar + header).
 */
export default function AdminHomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <HomePageContent forceShowSearch productLinkPrefix="/admin/products" />
    </div>
  );
}
