import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden flex flex-col">
      <DashboardSidebar />
      <div id="dashboard-content" className="w-full lg:pl-64 transition-all duration-300 overflow-x-hidden flex flex-col flex-1">
        <Navbar />
        <main className="py-8 px-4 sm:px-6 lg:px-8 w-full max-w-full flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

