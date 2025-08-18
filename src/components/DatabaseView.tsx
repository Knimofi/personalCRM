
import { ContactTable } from './ContactTable';
import { ExportButton } from './ExportButton';
import { useContacts } from '@/hooks/useContacts';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DatabaseView = () => {
  const { contacts, isLoading, error } = useContacts();

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Contact Database</h2>
          <ExportButton contacts={contacts} />
        </div>
        
        {/* Status */}
        <div className="text-sm text-gray-500">
          {isLoading ? 'Loading...' : `${contacts.length} contacts found`}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading contacts: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !error && contacts.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-2">No contacts found</h3>
          <p className="text-gray-500">
            Try sending a message to your Telegram bot to add contacts.
          </p>
        </div>
      )}
      
      <ContactTable contacts={contacts} isLoading={isLoading} />
    </div>
  );
};
