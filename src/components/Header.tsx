import React from 'react';
import { Presentation, Plus, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNewDeck?: () => void;
  showNewButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onNewDeck, showNewButton = true }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border glass-effect">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
            <Presentation className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">
            SmartPitch <span className="text-secondary">Coach</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {showNewButton && (
            <Button onClick={onNewDeck} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Deck</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
