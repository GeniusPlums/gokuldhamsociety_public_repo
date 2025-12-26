import { useState } from "react";
import { ThumbsUp, ThumbsDown, Laugh, Scale, ArrowRight, Plus, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useComplaints } from "@/hooks/useComplaints";
import { useFlats } from "@/hooks/useFlats";
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
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "open":
      return "bg-accent/50 text-foreground";
    case "under_review":
      return "bg-primary/10 text-primary";
    case "resolved":
      return "bg-secondary/10 text-secondary";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const ComplaintHighlights = () => {
  const { complaints, loading, createComplaint, reactToComplaint } = useComplaints();
  const { flats } = useFlats();
  const { user, flat } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [targetFlatId, setTargetFlatId] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [submitting, setSubmitting] = useState(false);

  const handleCreateComplaint = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    setSubmitting(true);
    const success = await createComplaint(
      newTitle,
      newContent,
      targetFlatId || null,
      isAnonymous,
      severity
    );
    if (success) {
      setNewTitle("");
      setNewContent("");
      setTargetFlatId("");
      setIsAnonymous(false);
      setSeverity("medium");
      setIsDialogOpen(false);
    }
    setSubmitting(false);
  };

  const claimedFlats = flats.filter(f => f.is_claimed && f.id !== flat?.id);

  if (loading) {
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
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wide">
                Conflict Zone
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Active Complaints
            </h2>
            <p className="text-muted-foreground">
              Society drama at its finest. Pick a side!
            </p>
          </div>
          {user && flat && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  File a Complaint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>File a Complaint</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>What's the issue?</Label>
                    <Input
                      placeholder="Brief title of complaint"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Details</Label>
                    <Textarea
                      placeholder="Describe the issue..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Against (optional)</Label>
                    <Select value={targetFlatId} onValueChange={setTargetFlatId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select flat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific flat</SelectItem>
                        {claimedFlats.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.building}-{f.flat_number} {f.owner?.display_name && `(${f.owner.display_name})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={isAnonymous}
                      onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                    />
                    <label
                      htmlFor="anonymous"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      File anonymously
                    </label>
                  </div>
                  <Button
                    variant="society"
                    className="w-full"
                    onClick={handleCreateComplaint}
                    disabled={submitting || !newTitle.trim() || !newContent.trim()}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "File Complaint"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold mb-2">Peace in the society!</h3>
            <p className="text-muted-foreground">No active complaints right now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {complaints.slice(0, 6).map((complaint, index) => (
              <div
                key={complaint.id}
                className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-elevated transition-shadow animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {complaint.severity === 'high' && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive mb-3">
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    HIGH SEVERITY
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 mb-4">
                  <h3 className="font-display font-bold text-foreground hover:text-primary cursor-pointer transition-colors">
                    {complaint.title}
                  </h3>
                  <span
                    className={`shrink-0 px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(
                      complaint.status
                    )}`}
                  >
                    {complaint.status.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  {complaint.target_flat && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Against:</span>
                      <span className="font-medium">
                        {complaint.target_flat.owner?.display_name || 'Unknown'}{" "}
                        <span className="flat-badge ml-1">
                          {complaint.target_flat.building}-{complaint.target_flat.flat_number}
                        </span>
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Filed by:</span>
                    <span className="font-medium">
                      {complaint.is_anonymous ? "Anonymous" : complaint.author?.display_name}{" "}
                      {!complaint.is_anonymous && complaint.flat && (
                        <span className="flat-badge ml-1">
                          {complaint.flat.building}-{complaint.flat.flat_number}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <button
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-secondary transition-colors"
                      onClick={() => reactToComplaint(complaint.id, 'agree')}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {complaint.agrees}
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                      onClick={() => reactToComplaint(complaint.id, 'disagree')}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {complaint.disagrees}
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => reactToComplaint(complaint.id, 'mock')}
                    >
                      <Laugh className="w-4 h-4" />
                      {complaint.mocks}
                    </button>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ComplaintHighlights;
