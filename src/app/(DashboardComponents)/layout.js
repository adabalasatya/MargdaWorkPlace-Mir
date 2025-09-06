import { Suspense } from 'react';
import DashboardNavbar from '@/components/Dashboard/Navbar/page'
import DashboardSidebar from "@/components/Dashboard/Sidebar/page"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-y-auto">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardNavbar />
        <main className="bg-white flex-grow overflow-auto border-gray-300">
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Loading...</div>
            </div>
          }>
            {children}
          </Suspense>
          <ToastContainer position="top-right" autoClose={3000} />
        </main>
      </div>
    </div>
  );
}
