import React, { Suspense, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Text, ContactShadows, useCursor, Center, MapControls } from '@react-three/drei';
import * as THREE from 'three';
import { useFlats } from "@/hooks/useFlats";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, User, ShieldCheck, Zap, Heart, History, Info, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

// Constants for proportions
const FLOOR_HEIGHT = 2.5;
const NUM_FLOORS = 5;
const BUILDING_WIDTH = 8;
const BUILDING_DEPTH = 6;
const BALCONY_WIDTH = 2;
const BALCONY_HEIGHT = 1.2;
const BALCONY_DEPTH = 0.8;

const Building = ({ position, rotation, wing, flats, onFlatClick, userFlatId, baseColor }: any) => {
  const floors = Array.from({ length: NUM_FLOORS });
  
  // Group flats by floor (approximate based on flat number or index)
  const flatsByFloor = useMemo(() => {
    const grouped: any = {};
    flats.forEach((flat: any, index: number) => {
      // In Gokuldham, flat numbers usually indicate floor (e.g., 101, 102 are 1st floor)
      const floorNum = Math.floor(parseInt(flat.flat_number) / 100) || (Math.floor(index / 2) + 1);
      if (!grouped[floorNum]) grouped[floorNum] = [];
      grouped[floorNum].push(flat);
    });
    return grouped;
  }, [flats]);

  return (
    <group position={position} rotation={rotation}>
      {/* Main Building Block */}
      <mesh position={[0, (NUM_FLOORS * FLOOR_HEIGHT) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BUILDING_WIDTH, NUM_FLOORS * FLOOR_HEIGHT, BUILDING_DEPTH]} />
        <meshStandardMaterial color={baseColor} roughness={0.8} />
      </mesh>

      {/* Floors Visual Separators */}
      {floors.map((_, i) => (
        <mesh key={i} position={[0, (i + 1) * FLOOR_HEIGHT, 0]} receiveShadow>
          <boxGeometry args={[BUILDING_WIDTH + 0.2, 0.1, BUILDING_DEPTH + 0.2]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
      ))}

      {/* Roof structure */}
      <mesh position={[0, NUM_FLOORS * FLOOR_HEIGHT + 0.5, 0]} castShadow>
        <boxGeometry args={[BUILDING_WIDTH + 0.5, 1, BUILDING_DEPTH + 0.5]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Wing Label */}
      <Text
        position={[0, NUM_FLOORS * FLOOR_HEIGHT + 2, 0]}
        fontSize={1.5}
        color="#c2410c"
        anchorX="center"
        anchorY="middle"
      >
        WING {wing}
      </Text>

      {/* Balconies / Flats */}
      {Object.entries(flatsByFloor).map(([floor, floorFlats]: [string, any]) => {
        const floorIdx = parseInt(floor) - 1;
        if (floorIdx >= NUM_FLOORS) return null;

        return floorFlats.map((flat: any, idx: number) => {
          // Position balconies side-by-side on the inward-facing side
          const xPos = (idx - (floorFlats.length - 1) / 2) * (BALCONY_WIDTH + 0.5);
          const yPos = floorIdx * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
          const zPos = BUILDING_DEPTH / 2 + BALCONY_DEPTH / 2;
          const isUserFlat = userFlatId === flat.id;

          return (
            <Balcony 
              key={flat.id}
              position={[xPos, yPos, zPos]}
              flat={flat}
              isUserFlat={isUserFlat}
              onClick={() => onFlatClick(flat)}
            />
          );
        });
      })}
    </group>
  );
};

const Balcony = ({ position, flat, onClick, isUserFlat }: any) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const color = useMemo(() => {
    if (isUserFlat) return "#f97316"; // Your flat
    if (flat.is_claimed) return "#0d9488"; // Occupied
    return "#94a3b8"; // Available
  }, [flat.is_claimed, isUserFlat]);

  return (
    <group 
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Balcony Base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BALCONY_WIDTH, 0.2, BALCONY_DEPTH]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Railings */}
      <mesh position={[0, BALCONY_HEIGHT / 2, BALCONY_DEPTH / 2]} castShadow>
        <boxGeometry args={[BALCONY_WIDTH, BALCONY_HEIGHT, 0.05]} />
        <meshStandardMaterial color="#4b5563" opacity={0.6} transparent />
      </mesh>
      
      {/* Flat Door Area (Clickable part) */}
      <mesh position={[0, BALCONY_HEIGHT / 2, -BALCONY_DEPTH / 4]} castShadow>
        <boxGeometry args={[BALCONY_WIDTH - 0.2, BALCONY_HEIGHT, 0.1]} />
        <meshStandardMaterial 
          color={color} 
          emissive={hovered ? color : "black"} 
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>

      {/* Flat Number */}
      <Text
        position={[0, BALCONY_HEIGHT / 2, 0.1]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {flat.flat_number}
      </Text>

      {/* Identity Indicator */}
      {flat.is_claimed && (
        <mesh position={[0, BALCONY_HEIGHT + 0.3, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  );
};

const MainGate = () => (
  <group position={[0, 0, 18]}>
    {/* Pillars */}
    <mesh position={[-4, 2, 0]} castShadow>
      <boxGeometry args={[1, 4, 1]} />
      <meshStandardMaterial color="#d1d5db" />
    </mesh>
    <mesh position={[4, 2, 0]} castShadow>
      <boxGeometry args={[1, 4, 1]} />
      <meshStandardMaterial color="#d1d5db" />
    </mesh>
    
    {/* Arch */}
    <mesh position={[0, 4.2, 0]} castShadow>
      <boxGeometry args={[9, 0.5, 1]} />
      <meshStandardMaterial color="#c2410c" />
    </mesh>
    <Text
      position={[0, 4.2, 0.51]}
      fontSize={0.4}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      GOKULDHAM SOCIETY
    </Text>

    {/* Watchman Cabin */}
    <mesh position={[-6, 1.5, -1]} castShadow>
      <boxGeometry args={[2, 3, 2]} />
      <meshStandardMaterial color="#fef3c7" />
    </mesh>
    <mesh position={[-6, 3, -1]} castShadow>
      <boxGeometry args={[2.5, 0.2, 2.5]} />
      <meshStandardMaterial color="#92400e" />
    </mesh>
  </group>
);

const NoticeBoard3D = ({ onClick }: any) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group 
      position={[0, 0, 8]} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Stand */}
      <mesh position={[-1, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <mesh position={[1, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      
      {/* Board */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[4, 2.5, 0.2]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.5} />
      </mesh>
      
      {/* Frame */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4.2, 2.7, 0.1]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>

      <Text
        position={[0, 2.8, 0.11]}
        fontSize={0.3}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        SOCIETY NOTICES
      </Text>
      <Text
        position={[0, 2.2, 0.11]}
        fontSize={0.15}
        color="#4b5563"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        Click to view latest drama & updates
      </Text>

      {hovered && (
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
        </mesh>
      )}
    </group>
  );
};

const MeetingHall3D = ({ onClick, position, label }: any) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group 
      position={position} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Building */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 4, 6]} />
        <meshStandardMaterial color="#0d9488" roughness={0.7} />
      </mesh>
      
      {/* Roof */}
      <mesh position={[0, 4.1, 0]}>
        <boxGeometry args={[6.5, 0.2, 6.5]} />
        <meshStandardMaterial color="#134e4a" />
      </mesh>

      {/* Windows */}
      <mesh position={[0, 2.5, 3.01]}>
        <planeGeometry args={[4, 1.5]} />
        <meshStandardMaterial color="#99f6e4" opacity={0.6} transparent />
      </mesh>

      <Text
        position={[0, 4.5, 0]}
        fontSize={0.6}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      {hovered && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[0, 5.5, 0]}>
            <coneGeometry args={[0.3, 0.6, 4]} />
            <meshStandardMaterial color="#0d9488" emissive="#0d9488" emissiveIntensity={1} />
          </mesh>
        </Float>
      )}
    </group>
  );
};

const Trees = () => (
  <group>
    {[
      [-12, 0, 12], [12, 0, 12], [-12, 0, -12], [12, 0, -12],
      [-18, 0, 0], [24, 0, 0], [0, 0, -28]
    ].map((pos, i) => (
      <group key={i} position={pos as [number, number, number]}>
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.3, 2]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
        <mesh position={[0, 3, 0]} castShadow>
          <sphereGeometry args={[1.5, 8, 8]} />
          <meshStandardMaterial color="#166534" />
        </mesh>
      </group>
    ))}
  </group>
);

const Scene = ({ flats, onFlatClick, userFlatId, onNoticeBoardClick, onMeetingHallClick }: any) => {
  const buildings = useMemo(() => {
    return flats.reduce((acc: any, flat: any) => {
      if (!acc[flat.building]) acc[flat.building] = [];
      acc[flat.building].push(flat);
      return acc;
    }, {});
  }, [flats]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[30, 30, 30]} fov={40} />
      <OrbitControls 
        enablePan={true} 
        maxPolarAngle={Math.PI / 2.1} 
        minPolarAngle={Math.PI / 6}
        minDistance={20} 
        maxDistance={80}
        rotateSpeed={0.5}
      />
      
      <ambientLight intensity={0.7} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Ground / Courtyard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial color="#e5e7eb" roughness={1} />
      </mesh>
      
      {/* Central Area Pavement */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>

      {/* Buildings Arrangement - Rectangular Layout */}
      {/* Left Side */}
      <Building 
        position={[-18, 0, -10]} 
        rotation={[0, Math.PI / 2, 0]}
        wing="A" 
        flats={buildings["A"] || []} 
        onFlatClick={onFlatClick} 
        userFlatId={userFlatId}
        baseColor="#fef3c7"
      />
      <Building 
        position={[-18, 0, 10]} 
        rotation={[0, Math.PI / 2, 0]}
        wing="C" 
        flats={buildings["C"] || []} 
        onFlatClick={onFlatClick} 
        userFlatId={userFlatId}
        baseColor="#fff7ed"
      />

      {/* Right Side */}
      <Building 
        position={[18, 0, -10]} 
        rotation={[0, -Math.PI / 2, 0]}
        wing="D" 
        flats={buildings["D"] || []} 
        onFlatClick={onFlatClick} 
        userFlatId={userFlatId}
        baseColor="#f3f4f6"
      />
      <Building 
        position={[0, 0, -18]} 
        rotation={[0, 0, 0]}
        wing="B" 
        flats={buildings["B"] || []} 
        onFlatClick={onFlatClick} 
        userFlatId={userFlatId}
        baseColor="#ecfdf5"
      />

      {/* Environment & Landmarks */}
      <MainGate position={[0, 0, 20]} />
      <NoticeBoard3D onClick={onNoticeBoardClick} />
      <MeetingHall3D 
        position={[18, 0, 10]} 
        label="SOCIETY OFFICE" 
        onClick={onMeetingHallClick} 
      />
      <MeetingHall3D 
        position={[18, 0, 0]} 
        label="CLUB HOUSE" 
        onClick={() => {}} 
      />
      <Trees />

      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={60} blur={2.5} far={10} />
      <Environment preset="sunset" />
    </>
  );
};

const ThreeSocietyMap = () => {
  const { flats, loading, claimFlat } = useFlats();
  const { user, flat: userFlat } = useAuth();
  const [selectedFlat, setSelectedFlat] = useState<any | null>(null);
  const [claimingFlat, setClaimingFlat] = useState<string | null>(null);
  const [isLowEnd, setIsLowEnd] = useState(() => localStorage.getItem("lowEndMode") === "true");
  const navigate = useNavigate();

  useEffect(() => {
    const handleLowEndChange = (e: any) => setIsLowEnd(e.detail);
    window.addEventListener("lowEndModeChange", handleLowEndChange);
    return () => window.removeEventListener("lowEndModeChange", handleLowEndChange);
  }, []);

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

  if (loading) {
    return (
      <div className="h-[700px] flex items-center justify-center bg-society-cream/50 rounded-3xl border border-border">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="py-20 bg-society-cream/50" id="map">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black mb-4 uppercase tracking-[0.2em]">
              <MapIcon className="w-3.5 h-3.5" />
              Live 3D Society
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore Gokuldham
            </h2>
            <p className="text-muted-foreground text-lg">
              Click on balconies to view residents, visit the notice board for drama, 
              or head to the office for meetings. This is your digital home.
            </p>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-6 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0d9488]" />
                <span className="text-xs font-bold text-muted-foreground">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#94a3b8]" />
                <span className="text-xs font-bold text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f97316]" />
                <span className="text-xs font-bold text-muted-foreground">Yours</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[700px] w-full bg-[#111] rounded-[2.5rem] border-8 border-background shadow-2xl overflow-hidden relative group cursor-grab active:cursor-grabbing">
          <Canvas shadows dpr={[1, 2]}>
            <Suspense fallback={null}>
              <Scene 
                flats={flats} 
                onFlatClick={setSelectedFlat} 
                userFlatId={userFlat?.id}
                onNoticeBoardClick={() => document.getElementById('notices')?.scrollIntoView({ behavior: 'smooth' })}
                onMeetingHallClick={() => document.getElementById('polls')?.scrollIntoView({ behavior: 'smooth' })}
              />
            </Suspense>
          </Canvas>
          
          {/* HUD Overlay */}
          <div className="absolute top-8 left-8 flex flex-col gap-4 pointer-events-none">
            <div className="px-6 py-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 text-white shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Current Zone</p>
              <p className="text-lg font-display font-bold">Main Courtyard</p>
            </div>
          </div>

          <div className="absolute bottom-8 right-8 p-6 bg-black/40 backdrop-blur-xl rounded-[2rem] border border-white/10 text-white shadow-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Navigation Guide</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold">LMB</div>
                <span className="text-xs font-medium opacity-80">Rotate View</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold">RMB</div>
                <span className="text-xs font-medium opacity-80">Pan Society</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold">SCR</div>
                <span className="text-xs font-medium opacity-80">Zoom In/Out</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold">CLK</div>
                <span className="text-xs font-medium opacity-80">Interact</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flat Details Dialog */}
        <Dialog open={!!selectedFlat} onOpenChange={(open) => !open && setSelectedFlat(null)}>
          <DialogContent className="sm:max-w-md bg-society-cream border-primary/20">
            {selectedFlat && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-4 text-3xl font-display">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-black shadow-lg rotate-3">
                      {selectedFlat.building}-{selectedFlat.flat_number}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm uppercase tracking-widest text-primary font-black">Residence Details</span>
                      <span className="text-foreground">Wing {selectedFlat.building}</span>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-6">
                  <div className="relative group overflow-hidden rounded-[2rem] bg-card border-2 border-border p-6 transition-all hover:border-primary/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-4 ring-primary/5">
                          <User className="w-8 h-8" />
                        </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Resident Owner</p>
                            <p className="font-display text-2xl font-bold text-foreground">
                              {selectedFlat.owner?.display_name || 'Available Flat'}
                            </p>
                          </div>
                        </div>
                        {!selectedFlat.is_claimed && (
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                              Requirement: {selectedFlat.endorsements_required} Endorsements
                            </span>
                            <Button 
                              variant="society" 
                              size="lg" 
                              onClick={() => handleClaimFlat(selectedFlat.id)} 
                              disabled={!!userFlat || (profile?.endorsement_count || 0) < selectedFlat.endorsements_required}
                              className="shadow-xl shadow-primary/20"
                            >
                              {claimingFlat === selectedFlat.id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Claim Residence"}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {!selectedFlat.is_claimed && profile && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-muted-foreground">Your Endorsements</span>
                            <span className="text-xs font-black text-foreground">{profile.endorsement_count} / {selectedFlat.endorsements_required}</span>
                          </div>
                          <div className="w-full h-2 bg-secondary/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-1000" 
                              style={{ width: `${Math.min(100, (profile.endorsement_count / selectedFlat.endorsements_required) * 100)}%` }}
                            />
                          </div>
                          {profile.endorsement_count < selectedFlat.endorsements_required && (
                            <p className="text-[10px] text-primary font-bold mt-2 animate-pulse">
                              Invite {selectedFlat.endorsements_required - profile.endorsement_count} more friends to unlock this flat!
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                  {selectedFlat.is_claimed && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-[1.5rem] bg-secondary/10 border-2 border-secondary/20 text-center transition-transform hover:scale-105">
                          <ShieldCheck className="w-6 h-6 text-secondary mx-auto mb-2" />
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Trust</p>
                          <p className="text-2xl font-black text-secondary">{selectedFlat.trust_score}</p>
                        </div>
                        <div className="p-4 rounded-[1.5rem] bg-destructive/10 border-2 border-destructive/20 text-center transition-transform hover:scale-105">
                          <Zap className="w-6 h-6 text-destructive mx-auto mb-2" />
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Chaos</p>
                          <p className="text-2xl font-black text-destructive">{selectedFlat.chaos_score}</p>
                        </div>
                        <div className="p-4 rounded-[1.5rem] bg-accent/20 border-2 border-accent/30 text-center transition-transform hover:scale-105">
                          <Heart className="w-6 h-6 text-accent-foreground mx-auto mb-2" />
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Contrib</p>
                          <p className="text-2xl font-black text-accent-foreground">{selectedFlat.contribution_score}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-sm font-black text-foreground uppercase tracking-widest">
                          <History className="w-4 h-4 text-primary" />
                          Society Standing
                        </h4>
                        <div className="p-6 bg-white rounded-[2rem] border-2 border-dashed border-border text-sm text-muted-foreground leading-relaxed italic">
                          "{selectedFlat.trust_score > 60 ? (
                            "A pillar of the Gokuldham community. Their contributions and behavior set a high standard for all residents."
                          ) : selectedFlat.chaos_score > 20 ? (
                            "A colorful character who keeps the society meetings lively (and long). Often at the center of the latest dispute."
                          ) : (
                            "A respected member of the society family, currently building their reputation through active participation."
                          )}"
                        </div>
                      </div>
                    </>
                  )}

                  {!selectedFlat.is_claimed && (
                    <div className="flex items-start gap-4 p-6 bg-primary/10 rounded-[2rem] border-2 border-primary/20">
                      <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Empty Residence</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          This flat is currently awaiting a new family. Claiming it will give you full voting rights 
                          and the ability to participate in society drama!
                        </p>
                      </div>
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

export default ThreeSocietyMap;
