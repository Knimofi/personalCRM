import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Contact } from '@/types/contact';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { GroupedMarker } from './GroupedMarker';
import { MultiContactPopup } from './MultiContactPopup';
import { createRoot } from 'react-dom/client';
import { LocationType } from './MapView';

interface InteractiveMapProps {
  contacts: Contact[];
  locationType: LocationType;
}

interface LocationGroup {
  coordinates: string;
  latitude: number;
  longitude: number;
  contacts: Contact[];
}

export interface InteractiveMapRef {
  flyToLocation: (latitude: number, longitude: number) => void;
}

export const InteractiveMap = forwardRef<InteractiveMapRef, InteractiveMapProps>(({ contacts, locationType }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedLocationGroup, setSelectedLocationGroup] = useState<LocationGroup | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const { token: mapboxToken, isLoading: tokenLoading, error: tokenError } = useMapboxToken();

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    flyToLocation: (latitude: number, longitude: number) => {
      if (map.current) {
        console.log(`Flying to location: [${longitude}, ${latitude}]`);
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 10,
          duration: 2000,
          essential: true
        });
      }
    }
  }));

  // Get contacts with coordinates and group them by location
  const locationGroups = React.useMemo(() => {
    const contactsWithCoordinates = contacts.filter(contact => {
      if (locationType === 'where_live') {
        return contact.location_from_latitude && contact.location_from_longitude && 
               !isNaN(contact.location_from_latitude) && !isNaN(contact.location_from_longitude);
      } else {
        return contact.location_met_latitude && contact.location_met_longitude && 
               !isNaN(contact.location_met_latitude) && !isNaN(contact.location_met_longitude);
      }
    });

    console.log(`Found ${contactsWithCoordinates.length} contacts with valid coordinates out of ${contacts.length} total contacts for ${locationType}`);

    const groups: { [key: string]: Contact[] } = {};
    
    contactsWithCoordinates.forEach(contact => {
      // Group contacts that are very close to each other (within ~100m)
      const lat = locationType === 'where_live' ? contact.location_from_latitude! : contact.location_met_latitude!;
      const lng = locationType === 'where_live' ? contact.location_from_longitude! : contact.location_met_longitude!;
      
      const roundedLat = Math.round(lat * 1000) / 1000;
      const roundedLng = Math.round(lng * 1000) / 1000;
      const key = `${roundedLat}-${roundedLng}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(contact);
    });

    const groupArray = Object.entries(groups).map(([coordinates, groupContacts]) => {
      const [lat, lng] = coordinates.split('-').map(Number);
      return {
        coordinates,
        latitude: lat,
        longitude: lng,
        contacts: groupContacts,
      };
    });

    console.log(`Created ${groupArray.length} location groups:`, groupArray);
    return groupArray;
  }, [contacts, locationType]);

  const retryTokenFetch = () => {
    window.location.reload();
  };

  const closePopup = () => {
    setSelectedLocationGroup(null);
  };

  // Close popup when clicking on map - fixed with proper event handling
  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    // Only close popup if clicking directly on the map, not on markers
    if (selectedLocationGroup && !e.defaultPrevented) {
      console.log('Map clicked, closing popup');
      setSelectedLocationGroup(null);
    }
  };

  // Initialize map
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
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        projection: 'globe' as any,
        zoom: 4,
        center: [10, 54], // Center on Europe
      });

      // Add click handler to close popup - fixed
      map.current.on('click', handleMapClick);

      // Add error handling
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
      });

      // Add load event listener
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapError(null);
        setIsMapReady(true);
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

    return () => {
      if (map.current) {
        console.log('Cleaning up map');
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, tokenLoading]);

  // Add markers when map is ready and we have location groups
  useEffect(() => {
    if (!map.current || !isMapReady || !locationGroups.length) {
      console.log('Skipping marker addition:', { 
        mapExists: !!map.current, 
        mapReady: isMapReady,
        groupCount: locationGroups.length 
      });
      return;
    }

    console.log(`Adding ${locationGroups.length} location groups to map`);

    // Remove existing markers
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];

    // Add markers for each location group
    locationGroups.forEach((locationGroup, index) => {
      console.log(`Adding marker ${index + 1} for location group with ${locationGroup.contacts.length} contacts at [${locationGroup.longitude}, ${locationGroup.latitude}]`);
      
      // Create marker element container
      const markerEl = document.createElement('div');
      markerEl.style.cursor = 'pointer';
      
      // Create React root and render the GroupedMarker component
      const root = createRoot(markerEl);
      root.render(
        <GroupedMarker
          contacts={locationGroup.contacts}
          onClick={(e) => {
            // Prevent map click event from firing
            if (e) e.stopPropagation();
            console.log(`Marker clicked for location group with ${locationGroup.contacts.length} contacts`);
            setSelectedLocationGroup(locationGroup);
          }}
          onMouseEnter={() => {
            // Optional: could add hover effects here
          }}
          onMouseLeave={() => {
            // Optional: could remove hover effects here
          }}
        />
      );

      // Create marker with click event prevention
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([locationGroup.longitude, locationGroup.latitude])
        .addTo(map.current!);

      // Add click listener to marker element to prevent map click
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      markersRef.current.push(marker);
    });
    
    console.log(`Successfully added ${markersRef.current.length} markers to map`);
  }, [locationGroups, isMapReady]);

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
            locationType={locationType}
            onClose={closePopup} 
          />
        </div>
      )}
    </div>
  );
});

InteractiveMap.displayName = 'InteractiveMap';
