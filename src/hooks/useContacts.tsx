
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/contact';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export const useContacts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: contacts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      console.log('Fetching contacts from database...');
      
      // Temporarily fetch ALL contacts for debugging
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Raw query response:', { data, error });
      
      if (error) {
        console.error('Database query error:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} contacts:`, data);
      return data as Contact[];
    },
  });

  // Set up real-time subscription for new contacts
  useEffect(() => {
    console.log('Setting up real-time subscription...');
    
    const channel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('🎉 New contact added via real-time:', payload.new);
          
          // Invalidate and refetch contacts to get the latest data
          queryClient.invalidateQueries({ queryKey: ['contacts'] });
          
          toast({
            title: "New contact added!",
            description: `${payload.new.name} has been added to your contacts.`,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('Contact updated via real-time:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['contacts'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('Contact deleted via real-time:', payload.old);
          queryClient.invalidateQueries({ queryKey: ['contacts'] });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  const createContact = useMutation({
    mutationFn: async (contact: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Use default Telegram user ID if no authenticated user
      const userId = user?.id || '00000000-0000-0000-0000-000000000001';
      
      console.log('Creating contact with user ID:', userId);

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contact,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact created",
        description: "Contact has been added successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating contact:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateContact = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact updated",
        description: "Contact has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: "Contact deleted",
        description: "Contact has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    contacts,
    isLoading,
    error,
    refetch, // Added manual refresh capability
    createContact,
    updateContact,
    deleteContact,
  };
};
