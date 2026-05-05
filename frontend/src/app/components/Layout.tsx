import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Bell } from 'lucide-react';
import { useState } from 'react';
import { NotificationDialog } from './NotificationDialog';

export function Layout() {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-blue-600">FitAir</h1>
              <p className="text-xs text-gray-500">フィットエア</p>
            </div>
            <button 
              onClick={() => setShowNotification(true)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <header className="hidden md:flex px-8 py-4 absolute top-0 right-0 z-40">
          <div className="flex items-center justify-end">
            <button 
              onClick={() => setShowNotification(true)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-8">
          <Outlet />
        </main>

        <BottomNav />
      </div>

      <NotificationDialog open={showNotification} onClose={() => setShowNotification(false)} />
    </div>
  );
}