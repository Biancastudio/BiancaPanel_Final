
import { Menu } from 'lucide-react';

interface MobileTopBarProps {
  onOpenSidebar: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({ onOpenSidebar }) => {
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-sidebar border-b border-border z-30 sticky top-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.3)] overflow-hidden">
          <img src="/bs-logo.png" alt="Bianca Studio" className="w-full h-full object-contain mix-blend-screen" />
        </div>
        <span className="text-white font-semibold text-sm">Bianca Studio</span>
      </div>
      <button 
        onClick={onOpenSidebar}
        className="p-2 -mr-2 text-muted-foreground hover:text-white rounded-md hover:bg-white/5 transition-colors"
        data-testid="button-open-sidebar"
      >
        <Menu size={20} />
      </button>
    </div>
  );
};

