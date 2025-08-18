
import React from 'react';
import { Contact } from '@/types/contact';

interface GroupedMarkerProps {
  contacts: Contact[];
  onClick: (e?: Event) => void;
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e.nativeEvent);
  };

  return (
    <div
      className="relative cursor-pointer transform hover:scale-110 transition-transform"
      onClick={handleClick}
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
