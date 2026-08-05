import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MobileTopBar } from './MobileTopBar';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground relative">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden md:ml-64 relative">
        <MobileTopBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto w-full h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

