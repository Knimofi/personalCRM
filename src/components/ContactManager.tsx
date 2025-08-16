
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { DatabaseView } from './DatabaseView';
import { MapView } from './MapView';
import { useContacts } from '@/hooks/useContacts';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

const ContactManagerContent = () => {
  const [activeView, setActiveView] = useState<'database' | 'map'>('database');
  const { contacts, isLoading } = useContacts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      
      <main>
        {activeView === 'database' ? (
          <DatabaseView />
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Map</h2>
              <p className="text-gray-600">
                Visualize your contacts on an interactive world map.
              </p>
            </div>
            <MapView contacts={contacts} isLoading={isLoading} />
          </div>
        )}
      </main>
      
      <Toaster />
    </div>
  );
};

export const ContactManager = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ContactManagerContent />
    </QueryClientProvider>
  );
};
