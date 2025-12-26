import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Flat {
  id: string;
  building: string;
  flat_number: string;
  owner_id: string | null;
  trust_score: number;
  chaos_score: number;
  contribution_score: number;
  is_claimed: boolean;
  owner?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export const useFlats = () => {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const fetchFlats = async () => {
    const { data, error } = await supabase
      .from('flats')
      .select(`
        *,
        owner:profiles!flats_owner_id_fkey (
          id,
          display_name,
          avatar_url
        )
      `)
      .order('building')
      .order('flat_number');

    if (error) {
      console.error('Error fetching flats:', error);
      return;
    }

    setFlats(data || []);
    setLoading(false);
  };

  const claimFlat = async (flatId: string) => {
    if (!profile) {
      toast({
        title: 'Login required',
        description: 'Please login to claim a flat.',
        variant: 'destructive',
      });
      return false;
    }

    // Check if user already has a flat
    const existingFlat = flats.find(f => f.owner_id === profile.id);
    if (existingFlat) {
      toast({
        title: 'Already a resident',
        description: `You already own flat ${existingFlat.building}-${existingFlat.flat_number}`,
        variant: 'destructive',
      });
      return false;
    }

    const { error } = await supabase
      .from('flats')
      .update({
        owner_id: profile.id,
        is_claimed: true,
      })
      .eq('id', flatId)
      .is('owner_id', null);

    if (error) {
      toast({
        title: 'Failed to claim flat',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Welcome to Gokuldham!',
      description: 'You have successfully claimed your flat.',
    });

    await fetchFlats();
    await refreshProfile();
    return true;
  };

  useEffect(() => {
    fetchFlats();
  }, []);

  return { flats, loading, claimFlat, refetch: fetchFlats };
};
