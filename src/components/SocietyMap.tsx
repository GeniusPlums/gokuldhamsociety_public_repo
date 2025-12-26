import { useState } from "react";
import { useFlats } from "@/hooks/useFlats";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SocietyMap = () => {
  const { flats, loading, claimFlat } = useFlats();
  const { user, flat: userFlat } = useAuth();
  const [hoveredFlat, setHoveredFlat] = useState<string | null>(null);
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
  };

  const getFlatStyles = (flat: typeof flats[0], isHovered: boolean) => {
    const base = "relative flex items-center justify-center h-12 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer";
    const isUserFlat = userFlat?.id === flat.id;
    
    if (isUserFlat) {
      return `${base} bg-primary text-primary-foreground border-2 border-primary`;
    }
    
    if (isHovered && !flat.is_claimed) {
      return `${base} bg-primary text-primary-foreground scale-105 shadow-elevated z-10`;
    }
    
    if (flat.is_claimed) {
      return `${base} bg-secondary/20 text-secondary border-2 border-secondary/30 hover:border-secondary`;
    }
    
    return `${base} bg-muted text-muted-foreground border-2 border-dashed border-border hover:border-primary hover:text-primary`;
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
    <section className="py-16 bg-society-cream/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Society Map
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore the flats of Gokuldham. Find your neighbours, claim an empty flat, 
            or see who's making the most noise.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {Object.entries(buildings).map(([buildingId, buildingFlats], buildingIndex) => (
            <div
              key={buildingId}
              className="bg-card rounded-2xl p-6 border border-border shadow-card animate-slide-up opacity-0"
              style={{ animationDelay: `${buildingIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {buildingId}
                </div>
                <h3 className="font-display font-bold text-lg">Block {buildingId}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {buildingFlats.map((flat) => (
                  <div
                    key={flat.id}
                    className={getFlatStyles(flat, hoveredFlat === flat.id)}
                    onMouseEnter={() => setHoveredFlat(flat.id)}
                    onMouseLeave={() => setHoveredFlat(null)}
                    onClick={() => !flat.is_claimed && handleClaimFlat(flat.id)}
                  >
                    {claimingFlat === flat.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{flat.building}-{flat.flat_number}</span>
                    )}
                    
                    {hoveredFlat === flat.id && flat.owner?.display_name && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-20">
                        {flat.owner.display_name}
                      </div>
                    )}
                    
                    {!flat.is_claimed && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-card" />
                    )}
                    
                    {userFlat?.id === flat.id && (
                      <span className="absolute -top-1 -right-1 text-xs">🏠</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-secondary/20 border-2 border-secondary/30" />
            <span className="text-sm text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted border-2 border-dashed border-border" />
            <span className="text-sm text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary border-2 border-primary" />
            <span className="text-sm text-muted-foreground">Your Flat</span>
          </div>
        </div>

        {!user && (
          <div className="text-center mt-8">
            <Button variant="society" size="lg" onClick={() => navigate('/auth')}>
              Sign Up to Claim a Flat
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocietyMap;
