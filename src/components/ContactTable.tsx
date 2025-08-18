
import React, { useState, useMemo } from 'react';
import { Contact } from '@/types/contact';
import { ContactDetailModal } from './ContactDetailModal';
import { ContactEditModal } from './ContactEditModal';
import { ContactAvatar } from './ContactAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Edit, Trash2, Search, Calendar, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useContacts } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from './ConfirmationDialog';
import { formatBirthdayDate } from '@/utils/birthdayUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
}

export const ContactTable = ({ contacts, isLoading }: ContactTableProps) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const { updateContact, deleteContact } = useContacts();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Filter contacts based on search and visibility
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.location_from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.location_met?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.context?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesVisibility = showHidden || !contact.is_hidden;
      
      return matchesSearch && matchesVisibility;
    });
  }, [contacts, searchTerm, showHidden]);

  const handleToggleHidden = async (contact: Contact) => {
    updateContact.mutate({
      id: contact.id,
      is_hidden: !contact.is_hidden
    });
  };

  const handleDeleteContact = async (contact: Contact) => {
    try {
      await deleteContact.mutateAsync(contact.id);
      setContactToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="block md:hidden">
        {/* Search and filters */}
        <div className="flex flex-col space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowHidden(!showHidden)}
            className="self-start"
            size="sm"
          >
            {showHidden ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showHidden ? 'Hide Hidden' : 'Show Hidden'} ({contacts.filter(c => c.is_hidden).length})
          </Button>
        </div>

        {/* Mobile Contact Cards */}
        <div className="space-y-3">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-shadow ${
                contact.is_hidden ? 'opacity-60 border-gray-300' : 'border-gray-200'
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-start space-x-3">
                <ContactAvatar
                  name={contact.name}
                  profilePictureUrl={contact.profile_picture_url}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                  
                  {/* Location Info */}
                  {contact.location_from && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{contact.location_from}</span>
                    </div>
                  )}
                  
                  {/* Date Info */}
                  {contact.date_met && (
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>Met: {formatDate(contact.date_met)}</span>
                    </div>
                  )}
                  
                  {/* Birthday */}
                  {contact.birthday && (
                    <div className="flex items-center text-sm text-blue-600 mt-1">
                      <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>Birthday: {formatBirthdayDate(contact.birthday)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No contacts match your search.' : 'No contacts found.'}
          </div>
        )}

        {/* Modals */}
        {selectedContact && (
          <ContactDetailModal
            contact={selectedContact}
            isOpen={!!selectedContact}
            onClose={() => setSelectedContact(null)}
          />
        )}

        {editingContact && (
          <ContactEditModal
            contact={editingContact}
            isOpen={!!editingContact}
            onClose={() => setEditingContact(null)}
          />
        )}

        {contactToDelete && (
          <ConfirmationDialog
            isOpen={!!contactToDelete}
            onClose={() => setContactToDelete(null)}
            onConfirm={() => handleDeleteContact(contactToDelete)}
            title="Delete Contact"
            description={`Are you sure you want to delete ${contactToDelete.name}? This action cannot be undone.`}
            confirmLabel="Delete"
            confirmVariant="destructive"
          />
        )}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="hidden md:block">
      {/* Search and filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowHidden(!showHidden)}
          className="whitespace-nowrap"
        >
          {showHidden ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showHidden ? 'Hide Hidden' : 'Show Hidden'} ({contacts.filter(c => c.is_hidden).length})
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Lives In</TableHead>
              <TableHead>Met At</TableHead>
              <TableHead>Date Met</TableHead>
              <TableHead>Birthday</TableHead>
              <TableHead>Context</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow
                key={contact.id}
                className={`cursor-pointer hover:bg-gray-50 ${
                  contact.is_hidden ? 'opacity-60 bg-gray-50' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <TableCell>
                  <ContactAvatar
                    name={contact.name}
                    profilePictureUrl={contact.profile_picture_url}
                    size="sm"
                  />
                </TableCell>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.location_from || '-'}</TableCell>
                <TableCell>{contact.location_met || '-'}</TableCell>
                <TableCell>{contact.date_met ? formatDate(contact.date_met) : '-'}</TableCell>
                <TableCell>
                  {contact.birthday ? (
                    <span className="text-blue-600 font-medium">
                      {formatBirthdayDate(contact.birthday)}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={contact.context || ''}>
                    {contact.context || '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleHidden(contact);
                      }}
                      title={contact.is_hidden ? 'Show contact' : 'Hide contact'}
                    >
                      {contact.is_hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingContact(contact);
                      }}
                      title="Edit contact"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setContactToDelete(contact);
                      }}
                      title="Delete contact"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? 'No contacts match your search.' : 'No contacts found.'}
        </div>
      )}

      {/* Modals */}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          isOpen={!!selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}

      {editingContact && (
        <ContactEditModal
          contact={editingContact}
          isOpen={!!editingContact}
          onClose={() => setEditingContact(null)}
        />
      )}

      {contactToDelete && (
        <ConfirmationDialog
          isOpen={!!contactToDelete}
          onClose={() => setContactToDelete(null)}
          onConfirm={() => handleDeleteContact(contactToDelete)}
          title="Delete Contact"
          description={`Are you sure you want to delete ${contactToDelete.name}? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmVariant="destructive"
        />
      )}
    </div>
  );
};
