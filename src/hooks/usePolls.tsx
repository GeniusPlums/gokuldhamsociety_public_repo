import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Database } from '@/integrations/supabase/types';

type PollType = Database['public']['Enums']['poll_type'];
type PollStatus = Database['public']['Enums']['poll_status'];

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  votes: number;
}

export interface Poll {
  id: string;
  flat_id: string;
  author_id: string;
  title: string;
  description: string | null;
  poll_type: PollType;
  status: PollStatus;
  ends_at: string;
  created_at: string;
  options: PollOption[];
  total_votes: number;
  author?: {
    id: string;
    display_name: string;
  } | null;
  flat?: {
    id: string;
    building: string;
    flat_number: string;
  } | null;
  user_voted?: boolean;
}

export const usePolls = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, flat } = useAuth();
  const { toast } = useToast();

  const fetchPolls = async () => {
    const { data: pollsData, error } = await supabase
      .from('polls')
      .select(`
        *,
        author:profiles!polls_author_id_fkey (
          id,
          display_name
        ),
        flat:flats!polls_flat_id_fkey (
          id,
          building,
          flat_number
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching polls:', error);
      setLoading(false);
      return;
    }

    // Fetch options for each poll
    const pollIds = (pollsData || []).map(p => p.id);
    const { data: options } = await supabase
      .from('poll_options')
      .select('*')
      .in('poll_id', pollIds);

    // Check if user has voted
    let userVotes: string[] = [];
    if (flat) {
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('poll_id')
        .eq('flat_id', flat.id);
      userVotes = (votes || []).map(v => v.poll_id);
    }

    const pollsWithOptions = (pollsData || []).map(poll => {
      const pollOptions = (options || []).filter(o => o.poll_id === poll.id);
      const totalVotes = pollOptions.reduce((sum, o) => sum + o.votes, 0);
      return {
        ...poll,
        options: pollOptions,
        total_votes: totalVotes,
        user_voted: userVotes.includes(poll.id),
      };
    });

    setPolls(pollsWithOptions);
    
    // Set active poll (first active one)
    const active = pollsWithOptions.find(p => p.status === 'active' && new Date(p.ends_at) > new Date());
    setActivePoll(active || null);
    
    setLoading(false);
  };

  const createPoll = async (
    title: string,
    description: string,
    pollType: PollType,
    options: string[],
    endsAt: Date
  ) => {
    if (!profile || !flat) {
      toast({
        title: 'Flat required',
        description: 'You need to claim a flat to create polls.',
        variant: 'destructive',
      });
      return false;
    }

    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        flat_id: flat.id,
        author_id: profile.id,
        title,
        description,
        poll_type: pollType,
        ends_at: endsAt.toISOString(),
      })
      .select()
      .single();

    if (pollError) {
      toast({
        title: 'Failed to create poll',
        description: pollError.message,
        variant: 'destructive',
      });
      return false;
    }

    // Create options
    const optionInserts = options.map(opt => ({
      poll_id: pollData.id,
      option_text: opt,
    }));

    const { error: optError } = await supabase
      .from('poll_options')
      .insert(optionInserts);

    if (optError) {
      toast({
        title: 'Failed to create poll options',
        description: optError.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Poll created!',
      description: 'Residents can now vote on your poll.',
    });

    await fetchPolls();
    return true;
  };

  const vote = async (pollId: string, optionId: string) => {
    if (!profile || !flat) {
      toast({
        title: 'Flat required',
        description: 'You need to claim a flat to vote.',
        variant: 'destructive',
      });
      return false;
    }

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('flat_id', flat.id)
      .maybeSingle();

    if (existingVote) {
      toast({
        title: 'Already voted',
        description: 'Your flat has already voted on this poll.',
        variant: 'destructive',
      });
      return false;
    }

    // Record vote
    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        flat_id: flat.id,
        voter_id: profile.id,
      });

    if (voteError) {
      toast({
        title: 'Failed to vote',
        description: voteError.message,
        variant: 'destructive',
      });
      return false;
    }

    // Increment option vote count
    const option = activePoll?.options.find(o => o.id === optionId);
    if (option) {
      await supabase
        .from('poll_options')
        .update({ votes: option.votes + 1 })
        .eq('id', optionId);
    }

    toast({
      title: 'Vote recorded!',
      description: 'Your voice has been heard.',
    });

    await fetchPolls();
    return true;
  };

  useEffect(() => {
    fetchPolls();
  }, [flat]);

  return { polls, activePoll, loading, createPoll, vote, refetch: fetchPolls };
};
