
import React from 'react';
import { Contact } from '@/types/contact';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { LocationType } from './MapView';

interface LocationDropdownProps {
  contacts: Contact[];
  locationType: LocationType;
  onLocationSelect: (latitude: number, longitude: number) => void;
}

export const LocationDropdown = ({ contacts, locationType, onLocationSelect }: LocationDropdownProps) => {
  const contactsWithCoordinates = contacts.filter(contact => {
    if (locationType === 'where_live') {
      return contact.location_from_latitude && contact.location_from_longitude;
    } else {
      return contact.location_met_latitude && contact.location_met_longitude;
    }
  });
  
  // Group contacts by location
  const locationGroups = contactsWithCoordinates.reduce((groups, contact) => {
    const lat = locationType === 'where_live' ? contact.location_from_latitude! : contact.location_met_latitude!;
    const lng = locationType === 'where_live' ? contact.location_from_longitude! : contact.location_met_longitude!;
    const key = `${lat}-${lng}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(contact);
    return groups;
  }, {} as { [key: string]: Contact[] });

  const locations = Object.entries(locationGroups).map(([coordinates, groupContacts]) => {
    const [lat, lng] = coordinates.split('-').map(Number);
    const location = locationType === 'where_live' 
      ? (groupContacts[0].location_from || 'Unknown Location')
      : (groupContacts[0].location_met || 'Unknown Location');
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
