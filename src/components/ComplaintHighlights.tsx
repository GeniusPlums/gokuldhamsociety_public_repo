import { ThumbsUp, ThumbsDown, Laugh, Scale, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface Complaint {
  id: string;
  title: string;
  against: string;
  againstFlat: string;
  filedBy: string;
  filedByFlat: string;
  status: "open" | "under-review" | "resolved";
  reactions: {
    agree: number;
    disagree: number;
    mock: number;
  };
  escalated: boolean;
}

const complaints: Complaint[] = [
  {
    id: "1",
    title: "Playing drums at 6 AM every Sunday",
    against: "Jethalal",
    againstFlat: "A-101",
    filedBy: "Aatmaram Bhide",
    filedByFlat: "A-202",
    status: "under-review",
    reactions: { agree: 34, disagree: 12, mock: 8 },
    escalated: true,
  },
  {
    id: "2",
    title: "Parking in others' designated spots",
    against: "Sodhi",
    againstFlat: "A-301",
    filedBy: "Iyer",
    filedByFlat: "B-101",
    status: "open",
    reactions: { agree: 28, disagree: 5, mock: 3 },
    escalated: false,
  },
  {
    id: "3",
    title: "Feeding stray dogs in society compound",
    against: "Hathi",
    againstFlat: "B-201",
    filedBy: "Multiple Residents",
    filedByFlat: "Various",
    status: "open",
    reactions: { agree: 15, disagree: 42, mock: 18 },
    escalated: true,
  },
];

const getStatusStyles = (status: Complaint["status"]) => {
  switch (status) {
    case "open":
      return "bg-accent/50 text-foreground";
    case "under-review":
      return "bg-primary/10 text-primary";
    case "resolved":
      return "bg-secondary/10 text-secondary";
  }
};

const ComplaintHighlights = () => {
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
          <Button variant="outline" className="gap-2">
            File a Complaint
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {complaints.map((complaint, index) => (
            <div
              key={complaint.id}
              className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-elevated transition-shadow animate-slide-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {complaint.escalated && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive mb-3">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  ESCALATED TO POLL
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
                  {complaint.status.replace("-", " ")}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Against:</span>
                  <span className="font-medium">
                    {complaint.against}{" "}
                    <span className="flat-badge ml-1">{complaint.againstFlat}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Filed by:</span>
                  <span className="font-medium">
                    {complaint.filedBy}{" "}
                    <span className="flat-badge ml-1">{complaint.filedByFlat}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-secondary transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    {complaint.reactions.agree}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors">
                    <ThumbsDown className="w-4 h-4" />
                    {complaint.reactions.disagree}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Laugh className="w-4 h-4" />
                    {complaint.reactions.mock}
                  </button>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComplaintHighlights;
