import { useState } from "react";
import { ArrowUp, ArrowDown, MessageSquare, AlertTriangle, Megaphone, PartyPopper, Clock, Plus, Loader2, Share2, Filter, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";
import { useNotices, Notice, SortOption } from "@/hooks/useNotices";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type NoticeType = Database['public']['Enums']['notice_type'];

const getNoticeIcon = (type: NoticeType) => {
  switch (type) {
    case "emergency":
      return <AlertTriangle className="w-4 h-4" />;
    case "meeting":
      return <Megaphone className="w-4 h-4" />;
    case "festival":
      return <PartyPopper className="w-4 h-4" />;
    case "complaint":
      return <MessageSquare className="w-4 h-4" />;
    default:
      return <Megaphone className="w-4 h-4" />;
  }
};

const getNoticeStyles = (type: NoticeType) => {
  switch (type) {
    case "emergency":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "meeting":
      return "bg-primary/10 text-primary border-primary/20";
    case "festival":
      return "bg-accent/50 text-foreground border-accent";
    case "complaint":
      return "bg-secondary/10 text-secondary border-secondary/20";
    case "election":
      return "bg-primary/10 text-primary border-primary/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const NoticeBoard = () => {
  const { notices, loading, createNotice, voteNotice, escalateNotice, sortBy, setSortBy } = useNotices();
  const { user, flat } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEscalateDialogOpen, setIsEscalateDialogOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<NoticeType>("general");
  const [escalationReason, setEscalationReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateNotice = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    setSubmitting(true);
    const success = await createNotice(newTitle, newContent, newType);
    if (success) {
      setNewTitle("");
      setNewContent("");
      setNewType("general");
      setIsDialogOpen(false);
    }
    setSubmitting(false);
  };

  const handleEscalate = async () => {
    if (!selectedNoticeId || !escalationReason.trim()) return;
    
    setSubmitting(true);
    const success = await escalateNotice(selectedNoticeId, escalationReason);
    if (success) {
      setEscalationReason("");
      setSelectedNoticeId(null);
      setIsEscalateDialogOpen(false);
    }
    setSubmitting(false);
  };

  const handleShare = (notice: Notice) => {
    const shareData = {
      title: notice.title,
      text: `Check out this notice from Gokuldham Society: ${notice.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast({
        title: "Link copied!",
        description: "Notice link has been copied to clipboard.",
      });
    }
  };

  if (loading && notices.length === 0) {
    return (
      <section className="py-16">
        <div className="container flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Society Notices
            </h2>
            <p className="text-muted-foreground">
              Latest announcements, complaints, and happenings
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
              {(['new', 'trending', 'escalated', 'committee'] as SortOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    sortBy === option 
                      ? "bg-card text-primary shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>

            {user && flat && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="society" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Post Notice
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Post a Notice</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Notice Type</Label>
                      <Select value={newType} onValueChange={(v) => setNewType(v as NoticeType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="festival">Festival/Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="What's this about?"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        placeholder="Describe your notice... (Remember: Keep it civil, society members are watching!)"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        maxLength={500}
                        rows={4}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-muted-foreground italic">Tone hint: Simple, conversational Indian English</p>
                        <p className="text-xs text-muted-foreground">{newContent.length}/500</p>
                      </div>
                    </div>
                    <Button
                      variant="society"
                      className="w-full"
                      onClick={handleCreateNotice}
                      disabled={submitting || !newTitle.trim() || !newContent.trim()}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Notice"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {notices.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">No notices yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to post a notice!</p>
            {user && flat && (
              <Button variant="society" onClick={() => setIsDialogOpen(true)}>
                Post First Notice
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {notices.map((notice, index) => (
              <article
                key={notice.id}
                className={`notice-card animate-slide-up opacity-0 ${notice.is_escalated ? 'border-destructive/30 bg-destructive/[0.02]' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {notice.is_pinned && (
                  <div className="absolute -top-2 right-4 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full z-10">
                    📌 Pinned
                  </div>
                )}

                <div className="flex gap-4">
                  {/* Upvote Section */}
                  <div className="flex flex-col items-center gap-1 min-w-[50px]">
                    <button
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                      onClick={() => voteNotice(notice.id, 'up')}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-foreground">{notice.upvotes - notice.downvotes}</span>
                    <button
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                      onClick={() => voteNotice(notice.id, 'down')}
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getNoticeStyles(
                          notice.notice_type
                        )}`}
                      >
                        {getNoticeIcon(notice.notice_type)}
                        {notice.notice_type.charAt(0).toUpperCase() + notice.notice_type.slice(1)}
                      </span>
                      {notice.flat && (
                        <span className="flat-badge">
                          🏠 {notice.flat.building}-{notice.flat.flat_number}
                        </span>
                      )}
                      {notice.is_escalated && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-destructive text-destructive-foreground rounded-full">
                          <ShieldAlert className="w-3 h-3" />
                          Escalated
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-lg text-foreground mb-2 hover:text-primary cursor-pointer transition-colors">
                      {notice.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-3">
                      {notice.content}
                    </p>

                    {notice.is_escalated && notice.escalation_reason && (
                      <div className="mb-4 p-3 bg-destructive/5 rounded-lg border border-destructive/10 text-xs italic">
                        <span className="font-bold text-destructive">Reason for escalation:</span> {notice.escalation_reason}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="font-medium text-foreground">Posted by {notice.author?.display_name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
                        </span>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {notice.comment_count || 0} comments
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleShare(notice)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        {!notice.is_escalated && user && (
                          <button 
                            onClick={() => {
                              setSelectedNoticeId(notice.id);
                              setIsEscalateDialogOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Escalate to Committee"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Escalation Dialog */}
        <Dialog open={isEscalateDialogOpen} onOpenChange={setIsEscalateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escalate to Committee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Escalating a notice flags it for the society committee. Please provide a clear reason for escalation.
              </p>
              <div className="space-y-2">
                <Label>Reason for Escalation</Label>
                <Textarea
                  placeholder="Why should this be escalated? (e.g. Offensive language, critical safety issue, unresolved dispute)"
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  maxLength={200}
                />
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleEscalate}
                disabled={submitting || !escalationReason.trim()}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Escalate Notice"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default NoticeBoard;
