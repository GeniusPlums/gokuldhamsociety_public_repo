import { Crown, Calendar, ArrowRight, Info } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const ElectionBanner = () => {
  const { toast } = useToast();
  const { user, flat } = useAuth();
  const navigate = useNavigate();

  const handleNominate = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!flat) {
      toast({
        title: "No Flat Claimed",
        description: "You must claim a flat before nominating yourself for the committee.",
        variant: "destructive",
      });
      const mapElement = document.getElementById('map');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    
    toast({
      title: "Nomination Registered!",
      description: "Your nomination for the upcoming elections has been recorded. Good luck, resident!",
    });
  };

  return (
    <section className="py-8">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-society-saffron to-primary p-6 md:p-8">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/20 text-primary-foreground">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-semibold text-primary-foreground uppercase tracking-wide">
                    Elections
                  </span>
                  <span className="flex items-center gap-1 text-primary-foreground/80 text-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    Starting Jan 1, 2026
                  </span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-1">
                  Society Committee Elections
                </h3>
                <p className="text-primary-foreground/80 max-w-lg">
                  Nominations are open for Secretary, Chairman, and Treasurer positions. 
                  Make your voice heard in shaping Gokuldham's future!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                  >
                    View Candidates
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Election Candidates</DialogTitle>
                    <DialogDescription>
                      The following residents have submitted their nominations for the upcoming elections.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-xl bg-muted border border-border flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        No candidates have been finalized yet. Nominations are currently in the review phase. 
                        Check back on January 1st!
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 group"
                onClick={handleNominate}
              >
                Nominate Yourself
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElectionBanner;
