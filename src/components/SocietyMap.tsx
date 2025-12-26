import { useState } from "react";
import { useFlats } from "@/hooks/useFlats";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Loader2, ShieldCheck, Zap, Heart, Info, User, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const SocietyMap = () => {
  const { flats, loading, claimFlat } = useFlats();
  const { user, flat: userFlat } = useAuth();
  const [hoveredFlat, setHoveredFlat] = useState<string | null>(null);
  const [selectedFlat, setSelectedFlat] = useState<typeof flats[0] | null>(null);
  const [claimingFlat, setClaimingFlat] = useState<string | null>(null);
  const navigate = useNavigate();

  // Group flats by building
  const buildings = flats.reduce((acc, flat) => {
    if (!acc[flat.building]) {
      acc[flat.building] = [];
    }
    acc[flat.building].push(flat);
    return acc;
  }, {} as Record<string, typeof flats>);

  const handleClaimFlat = async (flatId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setClaimingFlat(flatId);
    await claimFlat(flatId);
    setClaimingFlat(null);
    setSelectedFlat(null);
  };

  const getFlatStyles = (flat: typeof flats[0], isHovered: boolean) => {
    const base = "relative flex items-center justify-center h-12 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer overflow-hidden";
    const isUserFlat = userFlat?.id === flat.id;
    
    if (isUserFlat) {
      return `${base} bg-primary text-primary-foreground border-2 border-primary shadow-notice ring-2 ring-primary/20`;
    }
    
    if (isHovered && !flat.is_claimed) {
      return `${base} bg-primary text-primary-foreground scale-105 shadow-elevated z-10`;
    }
    
    if (flat.is_claimed) {
      return `${base} bg-secondary/10 text-secondary border-2 border-secondary/20 hover:border-secondary hover:bg-secondary/20`;
    }
    
    return `${base} bg-muted text-muted-foreground border-2 border-dashed border-border hover:border-primary hover:text-primary hover:bg-primary/5`;
  };

  if (loading) {
    return (
      <section className="py-16 bg-society-cream/50">
        <div className="container flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-society-cream/50" id="map">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
            Residents Map
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Society Map
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore the flats of Gokuldham. Find your neighbours, claim an empty flat, 
            or see who's making the most noise.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {Object.entries(buildings).sort().map(([buildingId, buildingFlats], buildingIndex) => (
            <div
              key={buildingId}
              className="bg-card rounded-2xl p-6 border border-border shadow-card animate-slide-up opacity-0 relative overflow-hidden"
              style={{ animationDelay: `${buildingIndex * 0.1}s` }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ShieldCheck className="w-24 h-24" />
              </div>
              
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-notice">
                  {buildingId}
                </div>
                <h3 className="font-display font-bold text-lg">Wing {buildingId}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 relative">
                {buildingFlats.map((flat) => (
                  <div
                    key={flat.id}
                    className={getFlatStyles(flat, hoveredFlat === flat.id)}
                    onMouseEnter={() => setHoveredFlat(flat.id)}
                    onMouseLeave={() => setHoveredFlat(null)}
                    onClick={() => setSelectedFlat(flat)}
                  >
                    {claimingFlat === flat.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{flat.building}-{flat.flat_number}</span>
                    )}
                    
                    {flat.is_claimed && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary/30" />
                    )}
                    
                    {hoveredFlat === flat.id && flat.owner?.display_name && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-foreground text-background text-[10px] font-bold rounded-lg shadow-elevated whitespace-nowrap z-20 animate-slide-up">
                        {flat.owner.display_name}
                      </div>
                    )}
                    
                    {!flat.is_claimed && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border border-card" />
                    )}
                    
                    {userFlat?.id === flat.id && (
                      <span className="absolute top-1 right-1 text-[10px]">⭐</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-12 p-6 bg-card/50 rounded-2xl border border-border/50 max-w-2xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-secondary/10 border-2 border-secondary/20" />
            <span className="text-sm font-medium text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-muted border-2 border-dashed border-border" />
            <span className="text-sm font-medium text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-primary border-2 border-primary shadow-sm" />
            <span className="text-sm font-medium text-muted-foreground">Your Flat</span>
          </div>
        </div>

        {!user && (
          <div className="text-center mt-12">
            <Button variant="society" size="lg" className="px-10 rounded-2xl shadow-elevated" onClick={() => navigate('/auth')}>
              Join the Society
            </Button>
          </div>
        )}

        {/* Flat Details Dialog */}
        <Dialog open={!!selectedFlat} onOpenChange={(open) => !open && setSelectedFlat(null)}>
          <DialogContent className="sm:max-w-md">
            {selectedFlat && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm">
                      {selectedFlat.building}-{selectedFlat.flat_number}
                    </span>
                    Flat Details
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-2xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Owner</p>
                        <p className="font-bold text-lg">{selectedFlat.owner?.display_name || 'Unclaimed'}</p>
                      </div>
                    </div>
                    {!selectedFlat.is_claimed && (
                      <Button variant="society" size="sm" onClick={() => handleClaimFlat(selectedFlat.id)} disabled={!!userFlat}>
                        Claim Flat
                      </Button>
                    )}
                  </div>

                  {selectedFlat.is_claimed && (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-2xl bg-secondary/5 border border-secondary/10 text-center">
                          <ShieldCheck className="w-5 h-5 text-secondary mx-auto mb-1" />
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Trust</p>
                          <p className="text-lg font-black text-secondary">{selectedFlat.trust_score}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-destructive/5 border border-destructive/10 text-center">
                          <Zap className="w-5 h-5 text-destructive mx-auto mb-1" />
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Chaos</p>
                          <p className="text-lg font-black text-destructive">{selectedFlat.chaos_score}</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20 text-center">
                          <Heart className="w-5 h-5 text-accent-foreground mx-auto mb-1" />
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Contrib</p>
                          <p className="text-lg font-black text-accent-foreground">{selectedFlat.contribution_score}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
                          <History className="w-4 h-4 text-primary" />
                          Reputation Summary
                        </h4>
                        <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 text-xs text-muted-foreground leading-relaxed">
                          {selectedFlat.trust_score > 60 ? (
                            "A highly respected resident of the society. Their word carries weight in polls."
                          ) : selectedFlat.chaos_score > 20 ? (
                            "Known for stirring up some society drama! Often involved in complaints."
                          ) : (
                            "A quiet resident contributing to the society's growth."
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {!selectedFlat.is_claimed && (
                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This flat is currently empty. If you're a new member of Gokuldham, you can claim it as your own!
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default SocietyMap;
