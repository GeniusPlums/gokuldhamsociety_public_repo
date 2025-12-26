import { useState } from "react";

type FlatStatus = "occupied" | "available" | "highlighted";

interface Flat {
  id: string;
  number: string;
  status: FlatStatus;
  resident?: string;
}

interface Building {
  id: string;
  name: string;
  flats: Flat[];
}

const buildings: Building[] = [
  {
    id: "A",
    name: "Block A",
    flats: [
      { id: "A-101", number: "101", status: "occupied", resident: "Jethalal" },
      { id: "A-102", number: "102", status: "occupied", resident: "Taarak Mehta" },
      { id: "A-201", number: "201", status: "available" },
      { id: "A-202", number: "202", status: "occupied", resident: "Aatmaram" },
      { id: "A-301", number: "301", status: "highlighted", resident: "Sodhi" },
      { id: "A-302", number: "302", status: "available" },
    ],
  },
  {
    id: "B",
    name: "Block B",
    flats: [
      { id: "B-101", number: "101", status: "occupied", resident: "Iyer" },
      { id: "B-102", number: "102", status: "available" },
      { id: "B-201", number: "201", status: "occupied", resident: "Hathi" },
      { id: "B-202", number: "202", status: "occupied", resident: "Popatlal" },
      { id: "B-301", number: "301", status: "available" },
      { id: "B-302", number: "302", status: "available" },
    ],
  },
  {
    id: "C",
    name: "Block C",
    flats: [
      { id: "C-101", number: "101", status: "available" },
      { id: "C-102", number: "102", status: "occupied", resident: "Abdul" },
      { id: "C-201", number: "201", status: "available" },
      { id: "C-202", number: "202", status: "available" },
      { id: "C-301", number: "301", status: "available" },
      { id: "C-302", number: "302", status: "available" },
    ],
  },
];

const SocietyMap = () => {
  const [hoveredFlat, setHoveredFlat] = useState<string | null>(null);

  const getFlatStyles = (status: FlatStatus, isHovered: boolean) => {
    const base = "relative flex items-center justify-center h-12 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer";
    
    if (isHovered) {
      return `${base} bg-primary text-primary-foreground scale-105 shadow-elevated z-10`;
    }
    
    switch (status) {
      case "occupied":
        return `${base} bg-secondary/20 text-secondary border-2 border-secondary/30 hover:border-secondary`;
      case "available":
        return `${base} bg-muted text-muted-foreground border-2 border-dashed border-border hover:border-primary hover:text-primary`;
      case "highlighted":
        return `${base} bg-primary/10 text-primary border-2 border-primary animate-pulse-soft`;
      default:
        return base;
    }
  };

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
          {buildings.map((building, buildingIndex) => (
            <div
              key={building.id}
              className="bg-card rounded-2xl p-6 border border-border shadow-card animate-slide-up opacity-0"
              style={{ animationDelay: `${buildingIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {building.id}
                </div>
                <h3 className="font-display font-bold text-lg">{building.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {building.flats.map((flat) => (
                  <div
                    key={flat.id}
                    className={getFlatStyles(flat.status, hoveredFlat === flat.id)}
                    onMouseEnter={() => setHoveredFlat(flat.id)}
                    onMouseLeave={() => setHoveredFlat(null)}
                  >
                    <span>{flat.id}</span>
                    {hoveredFlat === flat.id && flat.resident && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-20">
                        {flat.resident}
                      </div>
                    )}
                    {flat.status === "available" && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-card" />
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
            <div className="w-4 h-4 rounded bg-primary/10 border-2 border-primary" />
            <span className="text-sm text-muted-foreground">Active Now</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocietyMap;
