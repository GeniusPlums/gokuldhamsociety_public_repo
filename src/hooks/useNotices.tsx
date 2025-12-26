import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from './use-toast';
import { Database } from '@/integrations/supabase/types';

type NoticeType = Database['public']['Enums']['notice_type'];

export interface Notice {
  id: string;
  flat_id: string;
  author_id: string;
  title: string;
  content: string;
  notice_type: NoticeType;
  upvotes: number;
  downvotes: number;
  is_pinned: boolean;
  is_escalated: boolean;
  escalation_reason: string | null;
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
  comment_count?: number;
}

export type SortOption = 'new' | 'trending' | 'escalated' | 'committee';

export const useNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('new');
  const { profile, flat } = useAuth();
  const { toast } = useToast();

  const fetchNotices = async () => {
    setLoading(true);
    let query = supabase
      .from('notices')
      .select(`
        *,
        author:profiles!notices_author_id_fkey (
          id,
          display_name
        ),
        flat:flats!notices_flat_id_fkey (
          id,
          building,
          flat_number
        )
      `);

    // Apply sorting
    if (sortBy === 'new') {
      query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    } else if (sortBy === 'trending') {
      // Simple trending logic: upvotes - downvotes
      query = query.order('upvotes', { ascending: false });
    } else if (sortBy === 'escalated') {
      query = query.eq('is_escalated', true).order('created_at', { ascending: false });
    } else if (sortBy === 'committee') {
      query = query.in('notice_type', ['meeting', 'election']).order('created_at', { ascending: false });
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error fetching notices:', error);
      setLoading(false);
      return;
    }

    // Fetch comment counts
    const noticeIds = (data || []).map(n => n.id);
    if (noticeIds.length > 0) {
      const { data: comments } = await supabase
        .from('comments')
        .select('notice_id')
        .in('notice_id', noticeIds);

      const commentCounts: Record<string, number> = {};
      (comments || []).forEach(c => {
        commentCounts[c.notice_id] = (commentCounts[c.notice_id] || 0) + 1;
      });

      const noticesWithCounts = (data || []).map(notice => ({
        ...notice,
        comment_count: commentCounts[notice.id] || 0,
      }));

      setNotices(noticesWithCounts as Notice[]);
    } else {
      setNotices((data || []) as Notice[]);
    }

    setLoading(false);
  };

  const createNotice = async (title: string, content: string, noticeType: NoticeType) => {
    if (!profile || !flat) {
      toast({
        title: 'Flat required',
        description: 'You need to claim a flat to post notices.',
        variant: 'destructive',
      });
      return false;
    }

    const { error } = await supabase
      .from('notices')
      .insert({
        flat_id: flat.id,
        author_id: profile.id,
        title,
        content,
        notice_type: noticeType,
      });

    if (error) {
      toast({
        title: 'Failed to post notice',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Notice posted!',
      description: 'Your notice is now visible to all residents.',
    });

    await fetchNotices();
    return true;
  };

  const escalateNotice = async (noticeId: string, reason: string) => {
    if (!profile || !flat) return false;

    const { error } = await supabase
      .from('notices')
      .update({
        is_escalated: true,
        escalation_reason: reason
      })
      .eq('id', noticeId);

    if (error) {
      toast({
        title: 'Failed to escalate',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Notice escalated!',
      description: 'The committee has been notified.',
    });

    await fetchNotices();
    return true;
  };

  const voteNotice = async (noticeId: string, voteType: 'up' | 'down') => {
    if (!profile) {
      toast({
        title: 'Login required',
        description: 'Please login to vote.',
        variant: 'destructive',
      });
      return;
    }

    // Check existing vote
    const { data: existingVote } = await supabase
      .from('notice_votes')
      .select('*')
      .eq('notice_id', noticeId)
      .eq('profile_id', profile.id)
      .maybeSingle();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote
        await supabase
          .from('notice_votes')
          .delete()
          .eq('id', existingVote.id);
        
        // Update notice count
        const field = voteType === 'up' ? 'upvotes' : 'downvotes';
        const notice = notices.find(n => n.id === noticeId);
        if (notice) {
          await supabase
            .from('notices')
            .update({ [field]: Math.max(0, notice[field] - 1) })
            .eq('id', noticeId);
        }
      } else {
        // Change vote
        await supabase
          .from('notice_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
        
        // Update counts
        const notice = notices.find(n => n.id === noticeId);
        if (notice) {
          await supabase
            .from('notices')
            .update({
              upvotes: voteType === 'up' ? notice.upvotes + 1 : Math.max(0, notice.upvotes - 1),
              downvotes: voteType === 'down' ? notice.downvotes + 1 : Math.max(0, notice.downvotes - 1),
            })
            .eq('id', noticeId);
        }
      }
    } else {
      // New vote
      await supabase
        .from('notice_votes')
        .insert({
          notice_id: noticeId,
          profile_id: profile.id,
          vote_type: voteType,
        });
      
      // Update notice count
      const field = voteType === 'up' ? 'upvotes' : 'downvotes';
      const notice = notices.find(n => n.id === noticeId);
      if (notice) {
        await supabase
          .from('notices')
          .update({ [field]: notice[field] + 1 })
          .eq('id', noticeId);
      }
    }

    await fetchNotices();
  };

  useEffect(() => {
    fetchNotices();
  }, [sortBy]);

  return { notices, loading, createNotice, voteNotice, escalateNotice, sortBy, setSortBy, refetch: fetchNotices };
};
