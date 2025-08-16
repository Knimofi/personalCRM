
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Users } from 'lucide-react';

export const Header = () => {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Contact Manager</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <Button variant="outline" onClick={handleSignOut} size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};
