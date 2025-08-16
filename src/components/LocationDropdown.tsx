
import React from 'react';
import { Contact } from '@/types/contact';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface LocationDropdownProps {
  contacts: Contact[];
  onLocationSelect: (latitude: number, longitude: number) => void;
}

export const LocationDropdown = ({ contacts, onLocationSelect }: LocationDropdownProps) => {
  const contactsWithCoordinates = contacts.filter(contact => contact.latitude && contact.longitude);
  
  // Group contacts by location
  const locationGroups = contactsWithCoordinates.reduce((groups, contact) => {
    const key = `${contact.latitude}-${contact.longitude}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(contact);
    return groups;
  }, {} as { [key: string]: Contact[] });

  const locations = Object.entries(locationGroups).map(([coordinates, groupContacts]) => {
    const [lat, lng] = coordinates.split('-').map(Number);
    const location = groupContacts[0].location || 'Unknown Location';
    return {
      coordinates,
      location,
      latitude: lat,
      longitude: lng,
      count: groupContacts.length,
    };
  }).sort((a, b) => a.location.localeCompare(b.location));

  const handleLocationSelect = (coordinates: string) => {
    const location = locations.find(loc => loc.coordinates === coordinates);
    if (location) {
      onLocationSelect(location.latitude, location.longitude);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <MapPin className="h-4 w-4 text-gray-500" />
      <Select onValueChange={handleLocationSelect}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Jump to location..." />
        </SelectTrigger>
        <SelectContent>
          {locations.map(location => (
            <SelectItem key={location.coordinates} value={location.coordinates}>
              {location.location} ({location.count} contact{location.count > 1 ? 's' : ''})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
