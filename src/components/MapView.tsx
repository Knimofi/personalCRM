
import { useMemo, useRef, useState } from 'react';
import { Contact } from '@/types/contact';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveMap, InteractiveMapRef } from './InteractiveMap';
import { LocationDropdown } from './LocationDropdown';
import { TopLocationsStats } from './TopLocationsStats';
import { LocationToggle } from './LocationToggle';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapViewProps {
  contacts: Contact[];
  isLoading: boolean;
}

export type LocationType = 'where_live' | 'where_met';

export const MapView = ({ contacts, isLoading }: MapViewProps) => {
  const mapRef = useRef<InteractiveMapRef>(null);
  const [locationType, setLocationType] = useState<LocationType>('where_live');
  const isMobile = useIsMobile();
  
  const contactsWithCoordinates = useMemo(() => {
    if (locationType === 'where_live') {
      return contacts.filter(contact => 
        contact.location_from_latitude && 
        contact.location_from_longitude
      );
    } else {
      return contacts.filter(contact => 
        contact.location_met_latitude && 
        contact.location_met_longitude
      );
    }
  }, [contacts, locationType]);

  const handleLocationSelect = (latitude: number, longitude: number) => {
    console.log('Location selected in MapView:', { latitude, longitude });
    mapRef.current?.flyToLocation(latitude, longitude);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading map data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Controls and Stats */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <LocationDropdown 
              contacts={contactsWithCoordinates} 
              locationType={locationType}
              onLocationSelect={handleLocationSelect}
            />
            <LocationToggle 
              locationType={locationType}
              onLocationTypeChange={setLocationType}
            />
          </div>
          <div className={`${isMobile ? 'w-full' : 'lg:ml-auto'}`}>
            <TopLocationsStats contacts={contacts} locationType={locationType} />
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span className="text-sm sm:text-base">
              {locationType === 'where_live' ? 'Where People Live' : 'Where We Met'} - Interactive World Map
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contactsWithCoordinates.length > 0 ? (
            <InteractiveMap 
              ref={mapRef} 
              contacts={contactsWithCoordinates} 
              locationType={locationType}
            />
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Location Data</h3>
              <p className="text-gray-500 mb-4">
                {locationType === 'where_live' 
                  ? 'Contacts need residential location data to appear on the map. Add "Lives in" locations to your contacts to see them here.'
                  : 'Contacts need meeting location data to appear on the map. Add "Met at" locations to your contacts to see them here.'
                }
              </p>
              <div className="text-sm text-gray-500">
                <p className="mb-2">
                  {locationType === 'where_live' 
                    ? 'This map shows where your contacts currently live.'
                    : 'This map shows where you met your contacts.'
                  }
                </p>
                <p>Switch between views using the toggle above.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
