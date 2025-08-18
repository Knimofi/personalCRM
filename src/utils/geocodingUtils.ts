
export interface GeocodeResult {
  latitude: number;
  longitude: number;
}

export const geocodeLocation = async (location: string): Promise<GeocodeResult | null> => {
  if (!location || location.trim() === '') {
    return null;
  }

  try {
    console.log(`Geocoding location: ${location}`);
    
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const encodedLocation = encodeURIComponent(location.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1`,
      {
        headers: {
          'User-Agent': 'ContactManager/1.0'
        }
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('Geocoding response:', data);

    if (data && data.length > 0) {
      const result = data[0];
      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);
      
      if (!isNaN(latitude) && !isNaN(longitude)) {
        console.log(`Geocoded "${location}" to: ${latitude}, ${longitude}`);
        return { latitude, longitude };
      }
    }

    console.warn(`No geocoding results found for location: ${location}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const batchGeocodeContacts = async (contacts: any[], locationType: 'where_live' | 'where_met') => {
  const results = [];
  
  for (const contact of contacts) {
    const locationField = locationType === 'where_live' ? 'location_from' : 'location_met';
    const latField = locationType === 'where_live' ? 'location_from_latitude' : 'location_met_latitude';
    const lngField = locationType === 'where_live' ? 'location_from_longitude' : 'location_met_longitude';
    
    // Skip if already has coordinates or no location text
    if (contact[latField] && contact[lngField] || !contact[locationField]) {
      continue;
    }
    
    const coords = await geocodeLocation(contact[locationField]);
    if (coords) {
      results.push({
        id: contact.id,
        [latField]: coords.latitude,
        [lngField]: coords.longitude
      });
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
};
