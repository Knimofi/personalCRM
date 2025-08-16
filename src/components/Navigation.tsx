
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Map } from 'lucide-react';

interface NavigationProps {
  activeView: 'database' | 'map';
  onViewChange: (view: 'database' | 'map') => void;
}

export const Navigation = ({ activeView, onViewChange }: NavigationProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex space-x-1 max-w-7xl mx-auto">
        <Button
          variant={activeView === 'database' ? 'default' : 'ghost'}
          onClick={() => onViewChange('database')}
          className="flex items-center space-x-2"
        >
          <Database className="h-4 w-4" />
          <span>Database View</span>
        </Button>
        <Button
          variant={activeView === 'map' ? 'default' : 'ghost'}
          onClick={() => onViewChange('map')}
          className="flex items-center space-x-2"
        >
          <Map className="h-4 w-4" />
          <span>Map View</span>
        </Button>
      </div>
    </div>
  );
};
