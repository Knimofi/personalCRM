
import { ContactTable } from './ContactTable';
import { useContacts } from '@/hooks/useContacts';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Bug } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatabaseDebugger } from './DatabaseDebugger';
import { useState } from 'react';

export const DatabaseView = () => {
  const { contacts, isLoading, error, refetch } = useContacts();
  const [showDebugger, setShowDebugger] = useState(false);

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Contact Database</h2>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setShowDebugger(!showDebugger)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Bug className="h-4 w-4" />
              <span>Debug</span>
            </Button>
            <Button 
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
        <p className="text-gray-600">
          Manage and view all your contacts in a sortable table format.
        </p>
        
        {/* Debug Information */}
        <div className="mt-4 text-sm text-gray-500">
          Status: {isLoading ? 'Loading...' : `${contacts.length} contacts found`}
        </div>
      </div>

      {/* Database Debugger */}
      {showDebugger && <DatabaseDebugger />}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading contacts: {error.message}
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && contacts.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-2">No contacts found</h3>
          <p className="text-gray-500 mb-4">
            Try sending a message to your Telegram bot to add contacts, or use the Debug button above to troubleshoot.
          </p>
          <Button onClick={handleRefresh} variant="default">
            Refresh Contacts
          </Button>
        </div>
      )}
      
      <ContactTable contacts={contacts} isLoading={isLoading} />
    </div>
  );
};
