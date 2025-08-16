import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Mail, Instagram, Linkedin, Globe, Gift, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMapboxToken } from '@/hooks/useMapboxToken';

interface InteractiveMapProps {
  contacts: Contact[];
}

interface ContactPopupProps {
  contact: Contact;
  onClose: () => void;
}

const ContactPopup = ({ contact, onClose }: ContactPopupProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getSocialLink = (contact: Contact, type: 'email' | 'instagram' | 'linkedin' | 'website') => {
    switch (type) {
      case 'email': return contact.email ? `mailto:${contact.email}` : null;
      case 'instagram': return contact.instagram ? `https://instagram.com/${contact.instagram.replace('@', '')}` : null;
      case 'linkedin': return contact.linkedin;
      case 'website': return contact.website;
    }
  };

  return (
    <Card className="w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{contact.name}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {contact.location && (
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <MapPin className="h-3 w-3" />
            <span>{contact.location}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {contact.context && (
          <div>
            <p className="text-sm text-gray-700">{contact.context}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          {contact.date_met && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span>Met: {formatDate(contact.date_met)}</span>
            </div>
          )}
          
          {contact.birthday && (
            <div className="flex items-center space-x-1">
              <Gift className="h-3 w-3 text-gray-400" />
              <span>Birthday: {formatDate(contact.birthday)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {contact.email && (
            <a
              href={getSocialLink(contact, 'email')!}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
            >
              <Mail className="h-3 w-3" />
              <span>Email</span>
            </a>
          )}
          
          {contact.instagram && (
            <a
              href={getSocialLink(contact, 'instagram')!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
            >
              <Instagram className="h-3 w-3" />
              <span>Instagram</span>
            </a>
          )}
          
          {contact.linkedin && (
            <a
              href={getSocialLink(contact, 'linkedin')!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
            >
              <Linkedin className="h-3 w-3" />
              <span>LinkedIn</span>
            </a>
          )}
          
          {contact.website && (
            <a
              href={getSocialLink(contact, 'website')!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
            >
              <Globe className="h-3 w-3" />
              <span>Website</span>
            </a>
          )}
        </div>

        {contact.is_hidden && (
          <Badge variant="secondary" className="text-xs">
            Hidden Contact
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export const InteractiveMap = ({ contacts }: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const { token: mapboxToken, isLoading: tokenLoading, error: tokenError } = useMapboxToken();

  // Get contacts with coordinates
  const contactsWithCoordinates = contacts.filter(contact => 
    contact.latitude && contact.longitude
  );

  // Get date color for markers
  const getDateColor = (dateString?: string) => {
    if (!dateString) return '#6B7280'; // gray-500
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
    
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
        zoom: 1.5,
        center: [30, 15],
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
    if (!map.current || !contactsWithCoordinates.length) {
      console.log('Skipping marker addition:', { 
        mapExists: !!map.current, 
        contactCount: contactsWithCoordinates.length 
      });
      return;
    }

    console.log(`Adding ${contactsWithCoordinates.length} markers to map`);

    const addMarkers = () => {
      // Remove existing markers
      const existingMarkers = document.querySelectorAll('.contact-marker');
      existingMarkers.forEach(marker => marker.remove());

      // Add markers for each contact
      contactsWithCoordinates.forEach((contact, index) => {
        console.log(`Adding marker ${index + 1} for ${contact.name} at [${contact.longitude}, ${contact.latitude}]`);
        
        const color = getDateColor(contact.date_met);
        
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'contact-marker';
        markerEl.style.cssText = `
          width: 12px;
          height: 12px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        `;

        // Add hover effect
        markerEl.addEventListener('mouseenter', () => {
          markerEl.style.transform = 'scale(1.3)';
        });
        markerEl.addEventListener('mouseleave', () => {
          markerEl.style.transform = 'scale(1)';
        });

        // Create marker
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([contact.longitude!, contact.latitude!])
          .addTo(map.current!);

        // Add click handler
        markerEl.addEventListener('click', () => {
          console.log(`Marker clicked for ${contact.name}`);
          setSelectedContact(contact);
          
          // Close existing popup
          if (popupRef.current) {
            popupRef.current.remove();
          }

          // Create new popup
          const popupEl = document.createElement('div');
          
          const popup = new mapboxgl.Popup({
            offset: 15,
            closeButton: false,
            closeOnClick: false,
          })
            .setLngLat([contact.longitude!, contact.latitude!])
            .setDOMContent(popupEl)
            .addTo(map.current!);

          popupRef.current = popup;

          // Zoom to marker
          map.current?.easeTo({
            center: [contact.longitude!, contact.latitude!],
            zoom: Math.max(map.current.getZoom(), 5),
            duration: 1000,
          });
        });
      });
      
      console.log('All markers added successfully');
    };

    // Wait for map to load before adding markers
    if (map.current.isStyleLoaded()) {
      addMarkers();
    } else {
      map.current.on('load', addMarkers);
    }
  }, [contactsWithCoordinates, map.current]);

  const closePopup = () => {
    setSelectedContact(null);
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
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
      {selectedContact && (
        <div className="absolute top-4 left-4 z-10">
          <ContactPopup contact={selectedContact} onClose={closePopup} />
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
