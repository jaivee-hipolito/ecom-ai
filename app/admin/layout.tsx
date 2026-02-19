'use client';

import AdminRoute from '@/components/shared/AdminRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div
          id="admin-content"
          className="transition-all duration-300 lg:pl-64 w-full min-w-0"
        >
          <AdminHeader />
          <main className="py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 max-w-full overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
