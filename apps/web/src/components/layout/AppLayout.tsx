import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useUiStore } from '../../store/uiStore';
import { cn } from '../../utils/cn';

export const AppLayout: React.FC = () => {
  const { isSidebarCollapsed } = useUiStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-60'
        )}
      >
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

