
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Contact } from '@/types/contact';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { GroupedMarker } from './GroupedMarker';
import { MultiContactPopup } from './MultiContactPopup';
import { createRoot } from 'react-dom/client';

interface InteractiveMapProps {
  contacts: Contact[];
}

interface LocationGroup {
  coordinates: string;
  latitude: number;
  longitude: number;
  contacts: Contact[];
}

export const InteractiveMap = ({ contacts }: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedLocationGroup, setSelectedLocationGroup] = useState<LocationGroup | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const { token: mapboxToken, isLoading: tokenLoading, error: tokenError } = useMapboxToken();

  // Get contacts with coordinates and group them by location
  const locationGroups = React.useMemo(() => {
    const contactsWithCoordinates = contacts.filter(contact => 
      contact.latitude && contact.longitude
    );

    const groups: { [key: string]: Contact[] } = {};
    
    contactsWithCoordinates.forEach(contact => {
      // Group contacts that are very close to each other (within ~100m)
      const roundedLat = Math.round(contact.latitude! * 1000) / 1000;
      const roundedLng = Math.round(contact.longitude! * 1000) / 1000;
      const key = `${roundedLat}-${roundedLng}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(contact);
    });

    return Object.entries(groups).map(([coordinates, groupContacts]) => {
      const [lat, lng] = coordinates.split('-').map(Number);
      return {
        coordinates,
        latitude: lat,
        longitude: lng,
        contacts: groupContacts,
      };
    });
  }, [contacts]);

  // Get date color for markers
  const getDateColor = (contacts: Contact[]) => {
    if (!contacts.length) return '#6B7280'; // gray-500
    
    // Use the most recent contact's date for the group color
    const mostRecentDate = contacts
      .map(c => c.date_met ? new Date(c.date_met) : null)
      .filter(Boolean)
      .sort((a, b) => b!.getTime() - a!.getTime())[0];
    
    if (!mostRecentDate) return '#6B7280'; // gray-500
    
    const now = new Date();
    const diffInDays = (now.getTime() - mostRecentDate.getTime()) / (1000 * 3600 * 24);
    
    if (diffInDays <= 30) return '#10B981'; // green-500
    if (diffInDays <= 90) return '#F59E0B'; // yellow-500
    return '#EF4444'; // red-500
  };

  const retryTokenFetch = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tokenLoading) {
      console.log('Map initialization waiting for:', { 
        container: !!mapContainer.current, 
        token: !!mapboxToken, 
        tokenLoading 
      });
      return;
    }

    console.log('Initializing Mapbox with token...');
    
    try {
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        projection: 'globe' as any,
        zoom: 4,
        center: [10, 54], // Center on Europe
      });

      // Add error handling
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
      });

      // Add load event listener
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapError(null);
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add atmosphere and fog effects
      map.current.on('style.load', () => {
        console.log('Map style loaded');
        map.current?.setFog({
          color: 'rgb(255, 255, 255)',
          'high-color': 'rgb(200, 200, 225)',
          'horizon-blend': 0.2,
        });
      });

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Cleanup
    return () => {
      if (map.current) {
        console.log('Cleaning up map');
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, tokenLoading]);

  useEffect(() => {
    if (!map.current || !locationGroups.length) {
      console.log('Skipping marker addition:', { 
        mapExists: !!map.current, 
        groupCount: locationGroups.length 
      });
      return;
    }

    console.log(`Adding ${locationGroups.length} location groups to map`);

    const addMarkers = () => {
      // Remove existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add markers for each location group
      locationGroups.forEach((locationGroup, index) => {
        console.log(`Adding marker ${index + 1} for location group with ${locationGroup.contacts.length} contacts at [${locationGroup.longitude}, ${locationGroup.latitude}]`);
        
        const color = getDateColor(locationGroup.contacts);
        
        // Create marker element container
        const markerEl = document.createElement('div');
        
        // Create React root and render the GroupedMarker component
        const root = createRoot(markerEl);
        root.render(
          <GroupedMarker
            contacts={locationGroup.contacts}
            color={color}
            onClick={() => {
              console.log(`Marker clicked for location group with ${locationGroup.contacts.length} contacts`);
              setSelectedLocationGroup(locationGroup);
              
              // Zoom to marker
              map.current?.easeTo({
                center: [locationGroup.longitude, locationGroup.latitude],
                zoom: Math.max(map.current.getZoom(), 8),
                duration: 1000,
              });
            }}
            onMouseEnter={() => {
              // Optional: could add hover effects here
            }}
            onMouseLeave={() => {
              // Optional: could remove hover effects here
            }}
          />
        );

        // Create marker
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([locationGroup.longitude, locationGroup.latitude])
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
      
      console.log('All location group markers added successfully');
    };

    // Wait for map to load before adding markers
    if (map.current.isStyleLoaded()) {
      addMarkers();
    } else {
      map.current.on('load', addMarkers);
    }

    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [locationGroups]);

  const closePopup = () => {
    setSelectedLocationGroup(null);
  };

  // Show loading state
  if (tokenLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
          <div className="text-gray-600">Loading Mapbox...</div>
        </div>
      </div>
    );
  }

  // Show token error with retry option
  if (tokenError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 font-medium mb-2">Mapbox Configuration Error</div>
          <div className="text-gray-600 text-sm mb-4">{tokenError}</div>
          <div className="space-y-2">
            <Button onClick={retryTokenFetch} className="mr-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <div className="text-xs text-gray-500 mt-2">
              Make sure MAPBOX_ACCESS_TOKEN is configured in Supabase Edge Function Secrets
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show map error
  if (mapError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 font-medium mb-2">Map Loading Error</div>
          <div className="text-gray-600 text-sm">{mapError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className="w-full h-96 rounded-lg shadow-lg" />
      
      {/* Floating popup */}
      {selectedLocationGroup && (
        <div className="absolute top-4 left-4 z-10">
          <MultiContactPopup 
            contacts={selectedLocationGroup.contacts} 
            onClose={closePopup} 
          />
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-sm font-medium mb-2">Contact Age</div>
        <div className="space-y-1 text-xs">
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
            <span>Old (&gt;90 days)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
