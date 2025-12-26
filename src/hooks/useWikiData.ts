import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWikiData = () => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [dynamics, setDynamics] = useState<any[]>([]);
  const [arcs, setArcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [epRes, dynRes, arcRes] = await Promise.all([
        supabase.from('episodes').select('*').order('episode_number', { ascending: true }),
        supabase.from('dynamics').select('*').order('title', { ascending: true }),
        supabase.from('arcs').select('*').order('start_episode', { ascending: true })
      ]);

      if (epRes.data) setEpisodes(epRes.data);
      if (dynRes.data) setDynamics(dynRes.data);
      if (arcRes.data) setArcs(arcRes.data);
    } catch (error) {
      console.error('Error fetching wiki data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { episodes, dynamics, arcs, loading, refetch: fetchData };
};
