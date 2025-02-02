import { Menu } from 'lucide-react';
import { useState } from 'react';

interface MobileMenuProps {
  leftSidebar: React.ReactNode;
  rightSidebar: React.ReactNode;
}

export function MobileMenu({ leftSidebar, rightSidebar }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 rounded-full shadow-lg"
      >
        <Menu className="text-white" size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm">
          <div className="bg-[#262421] w-[280px] h-full right-0 absolute p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="md:hidden">{leftSidebar}</div>
              {rightSidebar}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}