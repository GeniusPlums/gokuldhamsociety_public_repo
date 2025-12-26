import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Contribution, TargetType, ContributionType, ConfidenceLevel } from '@/types/contributions';
import { toast } from 'sonner';

export const useContributions = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const submitContribution = async (data: {
    target_type: TargetType;
    target_id: string | null;
    contribution_type: ContributionType;
    content: any;
    reason: string;
    reference: string;
    confidence_level: ConfidenceLevel;
  }) => {
    if (!user) {
      toast.error('You must be logged in to contribute');
      return null;
    }

    setLoading(true);
    try {
      const { data: contribution, error } = await supabase
        .from('contributions')
        .insert({
          user_id: user.id,
          ...data,
          status: 'proposed'
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Contribution submitted for community review!');
      return contribution;
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit contribution');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (data: {
    contribution_id: string;
    accuracy_vote: 'yes' | 'no' | 'unsure';
    usefulness_vote: 'yes' | 'no' | 'unsure';
  }) => {
    if (!user) {
      toast.error('You must be logged in to review');
      return null;
    }

    try {
      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already reviewed this contribution');
        } else {
          throw error;
        }
        return null;
      }

      toast.success('Review submitted!');
      return review;
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
      return null;
    }
  };

  const getPendingContributions = async () => {
    const { data, error } = await supabase
      .from('contributions')
      .select('*, profiles(display_name)')
      .eq('status', 'proposed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contributions:', error);
      return [];
    }
    return data;
  };

  return {
    submitContribution,
    submitReview,
    getPendingContributions,
    loading
  };
};
