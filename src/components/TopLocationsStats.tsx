
import React, { useMemo } from 'react';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Globe } from 'lucide-react';

interface TopLocationsStatsProps {
  contacts: Contact[];
}

export const TopLocationsStats = ({ contacts }: TopLocationsStatsProps) => {
  const { topCities, topCountries } = useMemo(() => {
    const contactsWithLocation = contacts.filter(contact => contact.location);
    
    // Count contacts by city
    const cityCount: { [key: string]: number } = {};
    const countryCount: { [key: string]: number } = {};
    
    contactsWithLocation.forEach(contact => {
      if (contact.location) {
        // Assume location format is "City, Country" or just "City"
        const parts = contact.location.split(',').map(part => part.trim());
        
        if (parts.length >= 2) {
          // "City, Country" format
          const city = parts[0];
          const country = parts[parts.length - 1];
          
          cityCount[city] = (cityCount[city] || 0) + 1;
          countryCount[country] = (countryCount[country] || 0) + 1;
        } else {
          // Just city or country
          const location = parts[0];
          cityCount[location] = (cityCount[location] || 0) + 1;
        }
      }
    });
    
    const topCities = Object.entries(cityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city, count]) => ({ name: city, count }));
    
    const topCountries = Object.entries(countryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([country, count]) => ({ name: country, count }));
    
    return { topCities, topCountries };
  }, [contacts]);

  return (
    <Card className="w-96">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>Top Locations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Top Cities */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>Top Cities</span>
            </h4>
            {topCities.length > 0 ? (
              <div className="space-y-1">
                {topCities.map((city, index) => (
                  <div key={city.name} className="flex justify-between text-xs">
                    <span className="text-gray-700 truncate">{index + 1}. {city.name}</span>
                    <span className="font-medium ml-2">{city.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No city data</div>
            )}
          </div>
          
          {/* Top Countries */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center space-x-1">
              <Globe className="h-3 w-3" />
              <span>Top Countries</span>
            </h4>
            {topCountries.length > 0 ? (
              <div className="space-y-1">
                {topCountries.map((country, index) => (
                  <div key={country.name} className="flex justify-between text-xs">
                    <span className="text-gray-700 truncate">{index + 1}. {country.name}</span>
                    <span className="font-medium ml-2">{country.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No country data</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
