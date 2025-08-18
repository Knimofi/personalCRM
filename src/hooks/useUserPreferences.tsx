
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserPreferences {
  id: string;
  user_id: string;
  birthday_reminders_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          throw error;
        }

        return data as UserPreferences | null;
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  const createPreferences = useMutation({
    mutationFn: async (birthdayRemindersEnabled: boolean) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          birthday_reminders_enabled: birthdayRemindersEnabled,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] });
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<Pick<UserPreferences, 'birthday_reminders_enabled'>>) => {
      if (!user || !preferences) throw new Error('User not authenticated or preferences not found');
      
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] });
    },
  });

  const setBirthdayReminders = async (enabled: boolean) => {
    try {
      if (preferences) {
        await updatePreferences.mutateAsync({ birthday_reminders_enabled: enabled });
      } else {
        await createPreferences.mutateAsync(enabled);
      }
    } catch (error) {
      console.error('Error setting birthday reminders:', error);
      throw error;
    }
  };

  return {
    preferences,
    isLoading,
    setBirthdayReminders,
    isUpdating: createPreferences.isPending || updatePreferences.isPending,
  };
};
