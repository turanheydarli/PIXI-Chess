import React from 'react';

interface GameLayoutProps {
  header: React.ReactNode;
  leftSidebar: React.ReactNode;
  mainContent: React.ReactNode;
  rightSidebar: React.ReactNode;
}

export function GameLayout({ header, leftSidebar, mainContent, rightSidebar }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Fixed Header */}
      <header className="bg-[#262421] border-b border-gray-800 px-4 h-14 flex items-center justify-between fixed top-0 w-full z-50">
        {header}
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-14 relative">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)_280px] md:grid-cols-[240px_1fr] grid-cols-1 h-[calc(100vh-3.5rem)]">
          {/* Left Sidebar */}
          <aside className="bg-[#262421] border-r border-gray-800 p-4 overflow-y-auto hidden md:block">
            {leftSidebar}
          </aside>

          {/* Center Content */}
          <div className="bg-[#1d1d1b] flex flex-col items-center justify-center p-4">
            {mainContent}
          </div>

          {/* Right Sidebar */}
          <aside className="bg-[#262421] border-l border-gray-800 p-4 overflow-y-auto hidden lg:block">
            {rightSidebar}
          </aside>
        </div>
      </main>
    </div>
  );
}