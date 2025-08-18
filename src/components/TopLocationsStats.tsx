
import React from 'react';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { LocationType } from './MapView';
import { useIsMobile } from '@/hooks/use-mobile';

interface TopLocationsStatsProps {
  contacts: Contact[];
  locationType: LocationType;
}

export const TopLocationsStats = ({ contacts, locationType }: TopLocationsStatsProps) => {
  const isMobile = useIsMobile();
  
  // Count contacts by location
  const locationCounts = contacts.reduce((acc, contact) => {
    const location = locationType === 'where_live' ? contact.location_from : contact.location_met;
    if (location) {
      acc[location] = (acc[location] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Get top 3 locations only
  const topLocations = Object.entries(locationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (topLocations.length === 0) {
    return null;
  }

  const title = locationType === 'where_live' ? 'Top Living Locations' : 'Top Meeting Locations';

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center space-x-2">
          <BarChart3 className="h-4 w-4" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {topLocations.map(([location, count]) => (
            <div key={location} className="flex justify-between items-center text-sm">
              <span className="truncate flex-1 mr-2">{location}</span>
              <span className="font-medium text-blue-600 flex-shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
