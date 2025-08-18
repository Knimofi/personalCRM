
import React from 'react';
import { Contact } from '@/types/contact';
import { ContactAvatar } from './ContactAvatar';

interface GroupedMarkerProps {
  contacts: Contact[];
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const GroupedMarker = ({ 
  contacts, 
  onClick, 
  onMouseEnter, 
  onMouseLeave 
}: GroupedMarkerProps) => {
  const contactCount = contacts.length;

  // Show individual profile pictures for 1-3 contacts
  if (contactCount <= 3) {
    return (
      <div 
        className="flex items-center space-x-1 cursor-pointer transform hover:scale-110 transition-transform"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {contacts.map((contact, index) => (
          <div key={contact.id} className="relative">
            <ContactAvatar
              name={contact.name}
              profilePictureUrl={contact.profile_picture_url}
              size="sm"
              className="border-2 border-white shadow-lg"
            />
            {contactCount > 1 && index === contactCount - 1 && (
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {contactCount}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Show grouped marker for 4+ contacts
  return (
    <div
      className="relative cursor-pointer transform hover:scale-110 transition-transform"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white">
        {contactCount}
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-700 rounded-full"></div>
    </div>
  );
};
