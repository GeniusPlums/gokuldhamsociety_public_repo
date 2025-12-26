import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, MessageSquare, AlertTriangle, Megaphone, PartyPopper, Clock, Plus, Loader2, Share2, Filter, ShieldAlert, ChevronDown, ChevronUp, History, Sparkles, Info, Quote } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useNotices, Notice, SortOption } from "@/hooks/useNotices";
import { useSuvichaar } from "@/hooks/useSuvichaar";
import { useContributions } from "@/hooks/useContributions";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { NoticeComments } from "./NoticeComments";
import { Badge } from "./ui/badge";
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

const NoticeBoard = () => {
  const { notices, loading, createNotice, voteNotice, escalateNotice, sortBy, setSortBy } = useNotices();
  const { data: suvichaar, isLoading: loadingSuvichaar } = useSuvichaar();
  const { getRecentApproved } = useContributions();
  const { user, flat } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'notices' | 'activity'>('notices');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEscalateDialogOpen, setIsEscalateDialogOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<NoticeType>("general");
  const [escalationReason, setEscalationReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      const data = await getRecentApproved(14);
      setRecentActivity(data);
    };
    fetchActivity();

    const handleSwitchTab = (e: any) => {
      // Logic for guided exploration could trigger this, but for now we'll just handle general tab switching
      if (e.detail === 'notices' || e.detail === 'activity') {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('switchNoticeTab', handleSwitchTab);
    return () => window.removeEventListener('switchNoticeTab', handleSwitchTab);
  }, []);


  const toggleComments = (id: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
      <section className="py-16" id="notices">
        <div className="container flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-society-cream/30" id="notices">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button 
                onClick={() => setActiveTab('notices')}
                className={`font-display text-3xl md:text-4xl font-bold transition-colors ${activeTab === 'notices' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Society Notices
              </button>
              <span className="text-3xl font-display text-muted-foreground/30">/</span>
              <button 
                onClick={() => setActiveTab('activity')}
                className={`font-display text-3xl md:text-4xl font-bold transition-colors ${activeTab === 'activity' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Recent Activity
              </button>
            </div>
            <p className="text-muted-foreground">
              {activeTab === 'notices' 
                ? "Latest announcements, complaints, and happenings" 
                : `${recentActivity.length} new community-verified additions this week`}
            </p>
          </div>

          {activeTab === 'notices' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Suvichaar of the Day - Compact for mobile */}
              {!loadingSuvichaar && suvichaar && (
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl max-w-md animate-fade-in">
                  <Quote className="w-4 h-4 text-primary shrink-0" />
                  <div className="text-xs italic text-muted-foreground overflow-hidden">
                    <p className="truncate">"{suvichaar.content}"</p>
                    <p className="text-[10px] font-bold text-primary text-right">— {suvichaar.author}</p>
                  </div>
                </div>
              )}
              
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
          )}
        </div>

        {activeTab === 'notices' ? (
          notices.length === 0 ? (
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
                  <div className="flex gap-4">
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

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {notice.character && (
                            <Badge className="bg-primary hover:bg-primary/90 text-[10px] py-0 px-2 gap-1 uppercase font-black">
                              <ShieldAlert className="w-3 h-3" />
                              Official {notice.character.name}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] uppercase font-bold border-muted-foreground/20">
                            {notice.notice_type}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground mb-2 hover:text-primary cursor-pointer transition-colors">

                        {notice.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">{notice.content}</p>
                      {/* Rest of the notice card logic... */}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">No recent activity</h3>
                <p className="text-muted-foreground">Check back later for new community contributions.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentActivity.map((activity) => (
                  <Card key={activity.id} className="bg-card border-2 border-primary/5 hover:border-primary/20 transition-all group overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-black border-primary/20 text-primary">
                          {activity.target_type}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-display line-clamp-1">{activity.content.text}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 italic">
                        "{activity.reason}"
                      </p>
                      <div className="flex items-center justify-between border-t border-border/50 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {activity.profiles?.display_name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-[10px] font-bold text-foreground truncate max-w-[80px]">
                            {activity.profiles?.display_name || 'Anonymous'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase">
                          <Sparkles className="w-3 h-3" />
                          Verified
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-4">
              <Info className="w-6 h-6 text-primary shrink-0" />
              <div>
                <p className="font-bold text-foreground text-sm">How this works</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Every contribution goes through a multi-layer community verification process. Accuracy is prioritized over popularity to ensure the Gokuldham archives remain the definitive source for fans.
                </p>
              </div>
            </div>
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
