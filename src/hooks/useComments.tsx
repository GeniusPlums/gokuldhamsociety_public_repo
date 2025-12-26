import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from './use-toast';

export interface Comment {
  id: string;
  notice_id: string;
  author_id: string;
  flat_id: string;
  content: string;
  created_at: string;
  author?: {
    display_name: string;
  } | null;
  flat?: {
    building: string;
    flat_number: string;
  } | null;
}

export const useComments = (noticeId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, flat } = useAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles!comments_author_id_fkey (
          display_name
        ),
        flat:flats!comments_flat_id_fkey (
          building,
          flat_number
        )
      `)
      .eq('notice_id', noticeId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    setComments(data as Comment[]);
    setLoading(false);
  };

  const addComment = async (content: string) => {
    if (!profile || !flat) {
      toast({
        title: 'Flat required',
        description: 'You need to claim a flat to comment.',
        variant: 'destructive',
      });
      return false;
    }

    const { error } = await supabase
      .from('comments')
      .insert({
        notice_id: noticeId,
        author_id: profile.id,
        flat_id: flat.id,
        content,
      });

    if (error) {
      toast({
        title: 'Failed to post comment',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    await fetchComments();
    return true;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', profile?.id);

    if (error) {
      toast({
        title: 'Failed to delete comment',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    await fetchComments();
    return true;
  };

  useEffect(() => {
    if (noticeId) {
      fetchComments();
    }
  }, [noticeId]);

  return { comments, loading, addComment, deleteComment, refetch: fetchComments };
};
