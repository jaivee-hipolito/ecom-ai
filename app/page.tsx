'use client';

import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/shared/Navbar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Loading from '@/components/ui/Loading';
import Footer from '@/components/shared/Footer';
import HomePageContent from '@/components/shared/HomePageContent';

export default function Home() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        {isAuthenticated && <DashboardSidebar />}
        <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64' : ''} overflow-x-hidden`}>
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading size="lg" text="Loading..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      {isAuthenticated && <DashboardSidebar />}
      <div id="dashboard-content" className={`w-full transition-all duration-300 ${isAuthenticated ? 'lg:pl-64' : ''} overflow-x-hidden`}>
        <Navbar />
        <HomePageContent />
        <Footer />
      </div>
    </div>
  );
}
