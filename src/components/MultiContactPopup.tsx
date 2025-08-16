
import React from 'react';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Mail, Instagram, Linkedin, Globe, Gift, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MultiContactPopupProps {
  contacts: Contact[];
  onClose: () => void;
}

export const MultiContactPopup = ({ contacts, onClose }: MultiContactPopupProps) => {
  const location = contacts[0]?.location || 'Unknown Location';
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getSocialLink = (contact: Contact, type: 'email' | 'instagram' | 'linkedin' | 'website') => {
    switch (type) {
      case 'email': return contact.email ? `mailto:${contact.email}` : null;
      case 'instagram': return contact.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : null;
      case 'linkedin': return contact.linkedin;
      case 'website': return contact.website;
    }
  };

  return (
    <Card className="w-96 max-h-96 overflow-y-auto shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary">{contacts.length} contact{contacts.length > 1 ? 's' : ''}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={contact.id} className="border-b pb-3 last:border-b-0">
            <div className="font-medium text-base mb-2">{contact.name}</div>
            
            {contact.context && (
              <p className="text-sm text-gray-700 mb-2">{contact.context}</p>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              {contact.date_met && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span>Met: {formatDate(contact.date_met)}</span>
                </div>
              )}
              
              {contact.birthday && (
                <div className="flex items-center space-x-1">
                  <Gift className="h-3 w-3 text-gray-400" />
                  <span>Birthday: {formatDate(contact.birthday)}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {contact.email && (
                <a
                  href={getSocialLink(contact, 'email')!}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
                >
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </a>
              )}
              
              {contact.instagram && (
                <a
                  href={getSocialLink(contact, 'instagram')!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
                >
                  <Instagram className="h-3 w-3" />
                  <span>Instagram</span>
                </a>
              )}
              
              {contact.linkedin && (
                <a
                  href={getSocialLink(contact, 'linkedin')!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
                >
                  <Linkedin className="h-3 w-3" />
                  <span>LinkedIn</span>
                </a>
              )}
              
              {contact.website && (
                <a
                  href={getSocialLink(contact, 'website')!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
                >
                  <Globe className="h-3 w-3" />
                  <span>Website</span>
                </a>
              )}
            </div>

            {contact.is_hidden && (
              <Badge variant="secondary" className="text-xs mt-2">
                Hidden Contact
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
