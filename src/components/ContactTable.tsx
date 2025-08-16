
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
import { Search, Filter, Calendar, MapPin, Mail, Instagram, Linkedin, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContactTableProps {
  contacts: Contact[];
  isLoading: boolean;
}

export const ContactTable = ({ contacts, isLoading }: ContactTableProps) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.context?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || contact.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const uniqueLocations = [...new Set(contacts.map(c => c.location).filter(Boolean))];

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
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Instagram</TableHead>
              <TableHead className="font-semibold">LinkedIn</TableHead>
              <TableHead className="font-semibold">Website</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow
                key={contact.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedContact(contact)}
              >
                <TableCell className="font-medium">{contact.name}</TableCell>
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
    </div>
  );
};
