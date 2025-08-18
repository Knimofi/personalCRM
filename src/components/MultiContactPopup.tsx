
import React from 'react';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, MapPin, Calendar } from 'lucide-react';

interface MultiContactPopupProps {
  contacts: Contact[];
  onClose: () => void;
}

export const MultiContactPopup = ({ contacts, onClose }: MultiContactPopupProps) => {
  const location = contacts[0]?.location_from || 'Unknown Location';
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date unknown';
    return new Date(dateString).toLocaleDateString();
  };

  return (
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
          {contacts.length} contact{contacts.length > 1 ? 's' : ''} from this location
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-64">
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="border-b border-gray-100 pb-2 last:border-b-0">
              <div className="font-medium text-sm">{contact.name}</div>
              {contact.date_met && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
