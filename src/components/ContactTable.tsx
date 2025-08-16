
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Contact } from '@/types/contact';
import { ContactDetailModal } from './ContactDetailModal';
import { ContactEditModal } from './ContactEditModal';
import { ConfirmationDialog } from './ConfirmationDialog';
import { useContacts } from '@/hooks/useContacts';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Mail, 
  Instagram, 
  Linkedin, 
  Globe,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Gift
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
}

export const ContactTable = ({ contacts, isLoading }: ContactTableProps) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  
  const { updateContact, deleteContact } = useContacts();

  const filteredContacts = contacts.filter(contact => {
    // Filter by hidden status
    if (!showHidden && contact.is_hidden) return false;
    
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.context?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || contact.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = [...new Set(contacts.map(c => c.location).filter(Boolean))];
  const hiddenCount = contacts.filter(c => c.is_hidden).length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getSocialIcon = (type: 'email' | 'instagram' | 'linkedin' | 'website') => {
    switch (type) {
      case 'email': return <Mail className="h-3 w-3" />;
      case 'instagram': return <Instagram className="h-3 w-3" />;
      case 'linkedin': return <Linkedin className="h-3 w-3" />;
      case 'website': return <Globe className="h-3 w-3" />;
    }
  };

  const getSocialLink = (contact: Contact, type: 'email' | 'instagram' | 'linkedin' | 'website') => {
    switch (type) {
      case 'email': return contact.email ? `mailto:${contact.email}` : null;
      case 'instagram': return contact.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : null;
      case 'linkedin': return contact.linkedin;
      case 'website': return contact.website;
    }
  };

  const handleToggleHidden = async (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateContact.mutateAsync({
      id: contact.id,
      is_hidden: !contact.is_hidden,
    });
  };

  const handleEdit = async (data: Partial<Contact>) => {
    if (!editingContact) return;
    await updateContact.mutateAsync({
      id: editingContact.id,
      ...data,
    });
    setEditingContact(null);
  };

  const handleDelete = async () => {
    if (!deletingContact) return;
    await deleteContact.mutateAsync(deletingContact.id);
    setDeletingContact(null);
  };

  const SocialLink = ({ contact, type }: { contact: Contact; type: 'email' | 'instagram' | 'linkedin' | 'website' }) => {
    const link = getSocialLink(contact, type);
    const value = contact[type];
    
    if (!value) return <span className="text-gray-400">-</span>;
    
    if (link) {
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          onClick={(e) => e.stopPropagation()}
        >
          {getSocialIcon(type)}
          <span className="text-xs truncate max-w-[100px]">{type === 'email' ? value : type === 'instagram' ? `@${value.replace('@', '')}` : 'Link'}</span>
        </a>
      );
    }
    
    return <span className="text-xs text-gray-600 truncate max-w-[100px]">{value}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
        <Button
          variant={showHidden ? "default" : "outline"}
          onClick={() => setShowHidden(!showHidden)}
          size="sm"
          className="flex items-center space-x-2"
        >
          {showHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <span>{showHidden ? 'Hide Hidden' : `Show Hidden (${hiddenCount})`}</span>
        </Button>
        {(searchTerm || locationFilter) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setLocationFilter('');
            }}
            size="sm"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 px-1">
        Showing {filteredContacts.length} of {contacts.length} contacts
        {!showHidden && hiddenCount > 0 && ` (${hiddenCount} hidden)`}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Context</TableHead>
              <TableHead className="font-semibold">Date Met</TableHead>
              <TableHead className="font-semibold">Birthday</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Instagram</TableHead>
              <TableHead className="font-semibold">LinkedIn</TableHead>
              <TableHead className="font-semibold">Website</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow
                key={contact.id}
                className={`cursor-pointer hover:bg-gray-50 ${contact.is_hidden ? 'opacity-60' : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span>{contact.name}</span>
                    {contact.is_hidden && (
                      <Badge variant="secondary" className="text-xs">
                        <EyeOff className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {contact.location ? (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{contact.location}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <span className="text-sm text-gray-600 truncate block">
                    {contact.context || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{formatDate(contact.date_met)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {contact.birthday ? (
                    <div className="flex items-center space-x-1">
                      <Gift className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{formatDate(contact.birthday)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <SocialLink contact={contact} type="email" />
                </TableCell>
                <TableCell>
                  <SocialLink contact={contact} type="instagram" />
                </TableCell>
                <TableCell>
                  <SocialLink contact={contact} type="linkedin" />
                </TableCell>
                <TableCell>
                  <SocialLink contact={contact} type="website" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleToggleHidden(contact, e)}
                      className="h-8 w-8 p-0"
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
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingContact(contact);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
        <div className="text-center py-8 text-gray-500">
          {contacts.length === 0 ? 'No contacts yet.' : 'No contacts match your filters.'}
        </div>
      )}

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
          onSave={handleEdit}
          isLoading={updateContact.isPending}
        />
      )}

      {deletingContact && (
        <ConfirmationDialog
          isOpen={!!deletingContact}
          onClose={() => setDeletingContact(null)}
          onConfirm={handleDelete}
          title="Delete Contact"
          description={`Are you sure you want to delete ${deletingContact.name}? This action cannot be undone.`}
          confirmText="Delete"
          isDestructive
        />
      )}
    </div>
  );
};
