
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export const Header = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  if (isMobile) {
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-3 block md:hidden">
        <div className="max-w-7xl mx-auto">
          {/* First line: Icon and Title */}
          <div className="flex items-center space-x-3 mb-2">
            <Users className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <h1 className="text-xl font-bold text-gray-900 truncate">Contact Manager</h1>
          </div>
          
          {/* Second line: Email and Actions */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-600 truncate flex-1 min-w-0">{user?.email}</span>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button variant="outline" onClick={handleSettingsClick} size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleSignOut} size="sm" className="h-8 w-8 p-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 hidden md:block">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Contact Manager</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <Button variant="outline" onClick={handleSettingsClick} size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" onClick={handleSignOut} size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};
