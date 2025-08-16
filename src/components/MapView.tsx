
import { useMemo } from 'react';
import { Contact } from '@/types/contact';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveMap } from './InteractiveMap';
import { LocationDropdown } from './LocationDropdown';
import { TopLocationsStats } from './TopLocationsStats';

interface MapViewProps {
  contacts: Contact[];
  isLoading: boolean;
}

export const MapView = ({ contacts, isLoading }: MapViewProps) => {
  const contactsWithCoordinates = useMemo(() => {
    return contacts.filter(contact => contact.latitude && contact.longitude);
  }, [contacts]);

  const handleLocationSelect = (latitude: number, longitude: number) => {
    // This function will be used by the InteractiveMap component
    // We'll need to pass this down or implement it in the InteractiveMap
    console.log('Location selected:', { latitude, longitude });
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
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <LocationDropdown 
          contacts={contactsWithCoordinates} 
          onLocationSelect={handleLocationSelect}
        />
        <div className="lg:ml-auto">
          <TopLocationsStats contacts={contacts} />
        </div>
      </div>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Interactive World Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contactsWithCoordinates.length > 0 ? (
            <InteractiveMap contacts={contactsWithCoordinates} />
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Location Data</h3>
              <p className="text-gray-500 mb-4">
                Contacts need geographic coordinates to appear on the map. 
                Add locations to your contacts to see them here.
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Recent (≤30 days)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Medium (≤90 days)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Old ({'>'}90 days)</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
