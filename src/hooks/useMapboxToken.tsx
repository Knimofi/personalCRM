
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMapboxToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log('Attempting to fetch Mapbox token from Edge Function...');
        
        const { data, error } = await supabase.functions.invoke('get-mapbox-token', {
          body: {}
        });
        
        if (error) {
          console.error('Supabase function invoke error:', error);
          setError(`Edge Function Error: ${error.message || 'Unknown error'}`);
          return;
        }

        console.log('Edge Function response:', data);

        if (data && data.token) {
          console.log('Mapbox token received successfully');
          setToken(data.token);
          setError(null);
        } else if (data && data.error) {
          console.error('Edge Function returned error:', data.error);
          setError(data.error);
        } else {
          console.error('Unexpected response format:', data);
          setError('Invalid response from token service');
        }
      } catch (err) {
        console.error('Exception while fetching Mapbox token:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Network Error: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  return { token, isLoading, error };
};
