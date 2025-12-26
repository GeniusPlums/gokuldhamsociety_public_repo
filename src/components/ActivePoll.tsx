import { useState } from "react";
import { Vote, Clock, Users, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

const pollData = {
  id: "poll-1",
  title: "Should we allow pets in the society compound?",
  description: "A complaint has been escalated regarding pets in common areas. Cast your vote to decide the society's stance.",
  options: [
    { id: "1", label: "Yes, with proper leash and cleaning rules", votes: 67 },
    { id: "2", label: "Only small pets, no large dogs", votes: 45 },
    { id: "3", label: "No pets in common areas", votes: 38 },
    { id: "4", label: "Need more discussion first", votes: 22 },
  ],
  totalVotes: 172,
  endsIn: "2 days, 14 hours",
  isActive: true,
};

const ActivePoll = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (selectedOption) {
      setHasVoted(true);
    }
  };

  const getPercentage = (votes: number) => {
    return Math.round((votes / pollData.totalVotes) * 100);
  };

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
              {pollData.title}
            </h3>
            <p className="text-muted-foreground mb-6">
              {pollData.description}
            </p>

            <div className="space-y-3 mb-6">
              {pollData.options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => !hasVoted && setSelectedOption(option.id)}
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
                        <span className="font-medium">{option.label}</span>
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
                      <span className="font-medium">{option.label}</span>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {pollData.totalVotes} votes
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Ends in {pollData.endsIn}
                </span>
              </div>

              {!hasVoted ? (
                <Button
                  variant="society"
                  onClick={handleVote}
                  disabled={!selectedOption}
                >
                  Cast Your Vote
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
