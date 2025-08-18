
import React, { useState } from 'react';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContactAvatar } from './ContactAvatar';
import { ContactDetailModal } from './ContactDetailModal';
import { X, MapPin, Calendar } from 'lucide-react';
import { LocationType } from './MapView';

interface MultiContactPopupProps {
  contacts: Contact[];
  locationType: LocationType;
  onClose: () => void;
}

export const MultiContactPopup = ({ contacts, locationType, onClose }: MultiContactPopupProps) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const location = locationType === 'where_live' 
    ? (contacts[0]?.location_from || 'Unknown Location')
    : (contacts[0]?.location_met || 'Unknown Location');
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <Card className="w-80 max-h-96 overflow-hidden shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            {contacts.length} contact{contacts.length > 1 ? 's' : ''} {locationType === 'where_live' ? 'living here' : 'met here'}
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-64">
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex items-start space-x-3 border-b border-gray-100 pb-3 last:border-b-0 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                onClick={() => setSelectedContact(contact)}
              >
                <ContactAvatar
                  name={contact.name}
                  profilePictureUrl={contact.profile_picture_url}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate hover:text-blue-600 transition-colors">{contact.name}</div>
                  {contact.date_met && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>Met: {formatDate(contact.date_met)}</span>
                    </div>
                  )}
                  {contact.context && (
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {contact.context}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          isOpen={!!selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </>
  );
};
