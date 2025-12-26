import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2, Send, Trash2, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NoticeCommentsProps {
  noticeId: string;
}

export const NoticeComments = ({ noticeId }: NoticeCommentsProps) => {
  const { comments, loading, addComment, deleteComment } = useComments(noticeId);
  const { profile } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-4">
        <h4 className="font-bold text-sm text-foreground">Comments ({comments.length})</h4>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Start the conversation!</p>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {comments.map((comment) => (
              <div key={comment.id} className="group relative bg-muted/30 p-3 rounded-xl border border-border/50">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground">
                        {comment.author?.display_name || 'Resident'}
                      </span>
                      {comment.flat && (
                        <span className="ml-1 text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full font-bold">
                          {comment.flat.building}-{comment.flat.flat_number}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {profile?.id === comment.author_id && (
                      <button 
                        onClick={() => deleteComment(comment.id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2 border-t border-border">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
          className="resize-none text-sm"
          maxLength={300}
        />
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground italic">
            {newComment.length}/300
          </p>
          <Button 
            size="sm" 
            variant="society" 
            className="gap-2"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};
