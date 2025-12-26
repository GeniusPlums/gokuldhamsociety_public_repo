import { ArrowUp, MessageSquare, AlertTriangle, Megaphone, PartyPopper, Clock } from "lucide-react";
import { Button } from "./ui/button";

type NoticeType = "general" | "emergency" | "meeting" | "complaint" | "event";

interface Notice {
  id: string;
  type: NoticeType;
  title: string;
  content: string;
  author: string;
  flat: string;
  upvotes: number;
  comments: number;
  timeAgo: string;
  isPinned?: boolean;
}

const notices: Notice[] = [
  {
    id: "1",
    type: "emergency",
    title: "Water supply will be off tomorrow",
    content: "Municipal corporation has informed that water supply will be disrupted from 10 AM to 4 PM for pipeline maintenance. Please store water accordingly.",
    author: "Aatmaram Bhide",
    flat: "A-202",
    upvotes: 45,
    comments: 23,
    timeAgo: "2 hours ago",
    isPinned: true,
  },
  {
    id: "2",
    type: "complaint",
    title: "Loud music from A-101 after 11 PM",
    content: "This is the third time this week. Society rules clearly state quiet hours after 10 PM. Requesting committee to take action.",
    author: "Iyer",
    flat: "B-101",
    upvotes: 32,
    comments: 56,
    timeAgo: "4 hours ago",
  },
  {
    id: "3",
    type: "event",
    title: "Garba Night - Save the Date!",
    content: "Annual Navratri Garba celebration will be held on 15th October in the society compound. All residents are welcome!",
    author: "Daya Gada",
    flat: "A-101",
    upvotes: 89,
    comments: 12,
    timeAgo: "1 day ago",
  },
  {
    id: "4",
    type: "meeting",
    title: "Emergency Society Meeting - Parking Issue",
    content: "All flat owners are requested to attend the meeting regarding the ongoing parking disputes. Venue: Society Hall, Time: 7 PM.",
    author: "Secretary",
    flat: "Committee",
    upvotes: 28,
    comments: 8,
    timeAgo: "3 hours ago",
  },
];

const getNoticeIcon = (type: NoticeType) => {
  switch (type) {
    case "emergency":
      return <AlertTriangle className="w-4 h-4" />;
    case "meeting":
      return <Megaphone className="w-4 h-4" />;
    case "event":
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
    case "event":
      return "bg-accent/50 text-foreground border-accent";
    case "complaint":
      return "bg-secondary/10 text-secondary border-secondary/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const NoticeBoard = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Society Notices
            </h2>
            <p className="text-muted-foreground">
              Latest announcements, complaints, and happenings
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="notice" size="sm">
              Trending
            </Button>
            <Button variant="ghost" size="sm">
              New
            </Button>
            <Button variant="ghost" size="sm">
              Escalated
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {notices.map((notice, index) => (
            <article
              key={notice.id}
              className="notice-card animate-slide-up opacity-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {notice.isPinned && (
                <div className="absolute -top-2 right-4 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  📌 Pinned
                </div>
              )}

              <div className="flex gap-4">
                {/* Upvote Section */}
                <div className="flex flex-col items-center gap-1 min-w-[50px]">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <span className="font-bold text-foreground">{notice.upvotes}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getNoticeStyles(
                        notice.type
                      )}`}
                    >
                      {getNoticeIcon(notice.type)}
                      {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                    </span>
                    <span className="flat-badge">
                      🏠 {notice.flat}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-foreground mb-2 hover:text-primary cursor-pointer transition-colors">
                    {notice.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {notice.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{notice.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {notice.timeAgo}
                    </span>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {notice.comments} comments
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All Notices
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NoticeBoard;
