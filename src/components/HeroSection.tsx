import { ArrowRight, Home, Users, MessageSquare } from "lucide-react";
import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-society-yellow/50 border border-accent text-sm font-medium mb-6 animate-slide-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            Elections starting in 7 days
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 animate-slide-up stagger-1 opacity-0">
            Welcome to{" "}
            <span className="text-primary">Gokuldham Society</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up stagger-2 opacity-0">
            Claim your flat, post notices, vote on society matters, and become part 
            of India's most entertaining digital neighbourhood.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up stagger-3 opacity-0">
            <Button variant="society" size="xl" className="group">
              Claim Your Flat
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl">
              Explore Society
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-md mx-auto animate-slide-up stagger-4 opacity-0">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-xl bg-primary/10 text-primary">
                <Home className="w-6 h-6" />
              </div>
              <div className="font-display font-bold text-2xl text-foreground">128</div>
              <div className="text-sm text-muted-foreground">Flats Claimed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-xl bg-secondary/10 text-secondary">
                <Users className="w-6 h-6" />
              </div>
              <div className="font-display font-bold text-2xl text-foreground">2.4K</div>
              <div className="text-sm text-muted-foreground">Residents</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-xl bg-accent/30 text-foreground">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="font-display font-bold text-2xl text-foreground">856</div>
              <div className="text-sm text-muted-foreground">Notices Today</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
