import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from './use-toast';
import { Database } from '@/integrations/supabase/types';

type ComplaintStatus = Database['public']['Enums']['complaint_status'];

export interface Complaint {
  id: string;
  flat_id: string;
  author_id: string;
  target_flat_id: string | null;
  title: string;
  content: string;
  is_anonymous: boolean;
  severity: string;
  status: ComplaintStatus;
  agrees: number;
  disagrees: number;
  mocks: number;
  escalated_to_poll_id: string | null;
  created_at: string;
  author?: {
    id: string;
    display_name: string;
  } | null;
  flat?: {
    id: string;
    building: string;
    flat_number: string;
  } | null;
  target_flat?: {
    id: string;
    building: string;
    flat_number: string;
    owner?: {
      display_name: string;
    } | null;
  } | null;
}

export const useComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, flat } = useAuth();
  const { toast } = useToast();

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        author:profiles!complaints_author_id_fkey (
          id,
          display_name
        ),
        flat:flats!complaints_flat_id_fkey (
          id,
          building,
          flat_number
        ),
        target_flat:flats!complaints_target_flat_id_fkey (
          id,
          building,
          flat_number,
          owner:profiles!flats_owner_id_fkey (
            display_name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching complaints:', error);
      setLoading(false);
      return;
    }

    setComplaints(data as Complaint[] || []);
    setLoading(false);
  };

  const createComplaint = async (
    title: string,
    content: string,
    targetFlatId: string | null,
    isAnonymous: boolean,
    severity: 'low' | 'medium' | 'high'
  ) => {
    if (!profile || !flat) {
      toast({
        title: 'Flat required',
        description: 'You need to claim a flat to file complaints.',
        variant: 'destructive',
      });
      return false;
    }

    const { error } = await supabase
      .from('complaints')
      .insert({
        flat_id: flat.id,
        author_id: profile.id,
        target_flat_id: targetFlatId,
        title,
        content,
        is_anonymous: isAnonymous,
        severity,
      });

    if (error) {
      toast({
        title: 'Failed to file complaint',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Complaint registered!',
      description: 'Your complaint is now visible to all residents.',
    });

    await fetchComplaints();
    return true;
  };

  const reactToComplaint = async (complaintId: string, reactionType: 'agree' | 'disagree' | 'mock') => {
    if (!profile) {
      toast({
        title: 'Login required',
        description: 'Please login to react.',
        variant: 'destructive',
      });
      return;
    }

    // Check existing reaction
    const { data: existingReaction } = await supabase
      .from('complaint_reactions')
      .select('*')
      .eq('complaint_id', complaintId)
      .eq('profile_id', profile.id)
      .maybeSingle();

    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Remove reaction
        await supabase
          .from('complaint_reactions')
          .delete()
          .eq('id', existingReaction.id);
        
        const field = reactionType === 'agree' ? 'agrees' : reactionType === 'disagree' ? 'disagrees' : 'mocks';
        await supabase
          .from('complaints')
          .update({ [field]: Math.max(0, (complaint[field as keyof Complaint] as number) - 1) })
          .eq('id', complaintId);
      } else {
        // Change reaction
        const oldField = existingReaction.reaction_type === 'agree' ? 'agrees' : existingReaction.reaction_type === 'disagree' ? 'disagrees' : 'mocks';
        const newField = reactionType === 'agree' ? 'agrees' : reactionType === 'disagree' ? 'disagrees' : 'mocks';
        
        await supabase
          .from('complaint_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id);
        
        await supabase
          .from('complaints')
          .update({
            [oldField]: Math.max(0, (complaint[oldField as keyof Complaint] as number) - 1),
            [newField]: (complaint[newField as keyof Complaint] as number) + 1,
          })
          .eq('id', complaintId);
      }
    } else {
      // New reaction
      await supabase
        .from('complaint_reactions')
        .insert({
          complaint_id: complaintId,
          profile_id: profile.id,
          reaction_type: reactionType,
        });
      
      const field = reactionType === 'agree' ? 'agrees' : reactionType === 'disagree' ? 'disagrees' : 'mocks';
      await supabase
        .from('complaints')
        .update({ [field]: (complaint[field as keyof Complaint] as number) + 1 })
        .eq('id', complaintId);
    }

    await fetchComplaints();
  };

  const escalateToPoll = async (complaintId: string, pollTitle: string) => {
    if (!profile || !flat) return false;

    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return false;

    // 1. Create the poll
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 3);

    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        flat_id: flat.id,
        author_id: profile.id,
        title: pollTitle,
        description: `Escalated from complaint: ${complaint.title}`,
        poll_type: 'verdict',
        ends_at: endsAt.toISOString(),
      })
      .select()
      .single();

    if (pollError) {
      toast({
        title: 'Failed to escalate',
        description: pollError.message,
        variant: 'destructive',
      });
      return false;
    }

    // 2. Add options
    await supabase.from('poll_options').insert([
      { poll_id: pollData.id, option_text: 'Guilty' },
      { poll_id: pollData.id, option_text: 'Not Guilty' },
      { poll_id: pollData.id, option_text: 'Warning Only' }
    ]);

    // 3. Link complaint to poll
    await supabase
      .from('complaints')
      .update({
        status: 'under_review',
        escalated_to_poll_id: pollData.id
      })
      .eq('id', complaintId);

    toast({
      title: 'Complaint escalated!',
      description: 'A society poll has been created to resolve this.',
    });

    await fetchComplaints();
    return true;
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return { complaints, loading, createComplaint, reactToComplaint, escalateToPoll, refetch: fetchComplaints };
};
