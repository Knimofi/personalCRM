
import { ContactTable } from './ContactTable';
import { useContacts } from '@/hooks/useContacts';

export const DatabaseView = () => {
  const { contacts, isLoading } = useContacts();

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Database</h2>
        <p className="text-gray-600">
          Manage and view all your contacts in a sortable table format.
        </p>
      </div>
      
      <ContactTable contacts={contacts} isLoading={isLoading} />
    </div>
  );
};
