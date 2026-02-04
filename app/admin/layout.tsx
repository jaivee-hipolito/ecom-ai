'use client';

import { usePathname } from 'next/navigation';
import AdminRoute from '@/components/shared/AdminRoute';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isUsersPage = pathname?.startsWith('/admin/users');
  
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar hideOnMobile={isUsersPage} />
        <div 
          id="admin-content" 
          className={`transition-all duration-300 ${isUsersPage ? 'pl-0 lg:pl-64' : 'lg:pl-64'}`}
        >
          <AdminHeader />
          <main className="py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
