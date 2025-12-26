import { useState } from "react";
import { Vote, Clock, Users, CheckCircle2, Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { usePolls } from "@/hooks/usePolls";
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

const ActivePoll = () => {
  const { activePoll, loading, vote, createPoll } = usePolls();
  const { user, flat } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);

  const handleVote = async () => {
    if (!selectedOption || !activePoll) return;
    
    setVoting(true);
    await vote(activePoll.id, selectedOption);
    setVoting(false);
  };

  const handleCreatePoll = async () => {
    const validOptions = newOptions.filter(o => o.trim());
    if (!newTitle.trim() || validOptions.length < 2) return;
    
    setSubmitting(true);
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 3); // 3 days from now
    
    const success = await createPoll(newTitle, newDescription, 'opinion', validOptions, endsAt);
    if (success) {
      setNewTitle("");
      setNewDescription("");
      setNewOptions(["", "", ""]);
      setIsDialogOpen(false);
    }
    setSubmitting(false);
  };

  const getPercentage = (votes: number) => {
    if (!activePoll || activePoll.total_votes === 0) return 0;
    return Math.round((votes / activePoll.total_votes) * 100);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!activePoll) {
    return (
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="p-2 rounded-xl bg-primary/10 text-primary inline-block mb-4">
              <Vote className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              No Active Polls
            </h2>
            <p className="text-muted-foreground mb-6">
              There are no active polls right now. Start a conversation by creating one!
            </p>
            {user && flat && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="society" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Poll
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a Poll</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        placeholder="What do you want to ask?"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Textarea
                        placeholder="Add context..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Options (min 2)</Label>
                      {newOptions.map((opt, i) => (
                        <Input
                          key={i}
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newOptions];
                            updated[i] = e.target.value;
                            setNewOptions(updated);
                          }}
                        />
                      ))}
                      {newOptions.length < 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewOptions([...newOptions, ""])}
                        >
                          + Add Option
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="society"
                      className="w-full"
                      onClick={handleCreatePoll}
                      disabled={submitting || !newTitle.trim() || newOptions.filter(o => o.trim()).length < 2}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Poll"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </section>
    );
  }

  const hasVoted = activePoll.user_voted;

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Vote className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Active Poll
            </h2>
            <span className="ml-auto flex items-center gap-1 text-sm text-primary font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live
            </span>
          </div>

          <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-elevated">
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">
              {activePoll.title}
            </h3>
            {activePoll.description && (
              <p className="text-muted-foreground mb-6">
                {activePoll.description}
              </p>
            )}

            <div className="space-y-3 mb-6">
              {activePoll.options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => !hasVoted && !voting && setSelectedOption(option.id)}
                  className={`poll-option ${
                    selectedOption === option.id ? "selected" : ""
                  } ${hasVoted ? "cursor-default" : ""}`}
                >
                  {hasVoted ? (
                    <>
                      <div
                        className="absolute inset-0 bg-primary/10 rounded-lg transition-all duration-500"
                        style={{ width: `${getPercentage(option.votes)}%` }}
                      />
                      <div className="relative flex items-center justify-between w-full">
                        <span className="font-medium">{option.option_text}</span>
                        <span className="font-bold text-primary">
                          {getPercentage(option.votes)}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedOption === option.id
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                      >
                        {selectedOption === option.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                      <span className="font-medium">{option.option_text}</span>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {activePoll.total_votes} votes
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Ends {formatDistanceToNow(new Date(activePoll.ends_at), { addSuffix: true })}
                </span>
              </div>

              {!hasVoted ? (
                <Button
                  variant="society"
                  onClick={handleVote}
                  disabled={!selectedOption || voting || !user || !flat}
                >
                  {voting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cast Your Vote"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 text-secondary font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Vote Recorded!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivePoll;
