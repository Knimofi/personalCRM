
import React from 'react';
import { Contact } from '@/types/contact';

interface GroupedMarkerProps {
  contacts: Contact[];
  color: string;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const GroupedMarker = ({ contacts, color, onClick, onMouseEnter, onMouseLeave }: GroupedMarkerProps) => {
  const count = contacts.length;
  const size = count === 1 ? 12 : Math.min(20, 12 + count * 2);
  
  return (
    <div
      className="grouped-marker cursor-pointer transition-transform hover:scale-125"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        border: '2px solid white',
        borderRadius: '50%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: count > 1 ? '10px' : '0px',
        fontWeight: 'bold',
        color: 'white',
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {count > 1 && count}
    </div>
  );
};
