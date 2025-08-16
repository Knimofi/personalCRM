
import { useMemo } from 'react';
import { Contact } from '@/types/contact';
import { MapPin, Users, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InteractiveMap } from './InteractiveMap';

interface MapViewProps {
  contacts: Contact[];
  isLoading: boolean;
}

export const MapView = ({ contacts, isLoading }: MapViewProps) => {
  const contactsWithCoordinates = useMemo(() => {
    return contacts.filter(contact => contact.latitude && contact.longitude);
  }, [contacts]);

  const locationGroups = useMemo(() => {
    const groups: { [key: string]: Contact[] } = {};
    contactsWithCoordinates.forEach(contact => {
      const key = `${contact.latitude}-${contact.longitude}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(contact);
    });
    return groups;
  }, [contactsWithCoordinates]);

  const getDateColor = (dateString?: string) => {
    if (!dateString) return 'bg-gray-400';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    
    if (diffInDays <= 30) return 'bg-green-500'; // Recent - Green
    if (diffInDays <= 90) return 'bg-yellow-500'; // Medium - Yellow
    return 'bg-red-500'; // Old - Red
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
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactsWithCoordinates.length}</div>
            <p className="text-xs text-muted-foreground">
              {((contactsWithCoordinates.length / contacts.length) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Locations</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(locationGroups).length}</div>
          </CardContent>
        </Card>
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

      {/* Location Groups */}
      {Object.keys(locationGroups).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contacts by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(locationGroups).map(([coordinates, groupContacts]) => {
                const [lat, lng] = coordinates.split('-').map(Number);
                const location = groupContacts[0].location || 'Unknown Location';
                
                return (
                  <div key={coordinates} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{location}</span>
                        <Badge variant="secondary">{groupContacts.length} contact{groupContacts.length > 1 ? 's' : ''}</Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {lat.toFixed(4)}, {lng.toFixed(4)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {groupContacts.map(contact => (
                        <div key={contact.id} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getDateColor(contact.date_met)}`}></div>
                          <span className="text-sm">{contact.name}</span>
                          {contact.date_met && (
                            <span className="text-xs text-gray-500">
                              ({new Date(contact.date_met).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
