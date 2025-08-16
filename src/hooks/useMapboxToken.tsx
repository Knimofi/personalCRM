
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMapboxToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log('Fetching Mapbox token...');
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setError(`Failed to fetch Mapbox token: ${error.message}`);
          return;
        }

        if (data && data.token) {
          console.log('Mapbox token fetched successfully');
          setToken(data.token);
        } else {
          console.error('No token in response:', data);
          setError('No token received from server');
        }
      } catch (err) {
        console.error('Exception fetching Mapbox token:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  return { token, isLoading, error };
};
