import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float, Text, ContactShadows, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { useFlats } from "@/hooks/useFlats";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, User, ShieldCheck, Zap, Heart, History, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

const Building = ({ position, wing, flats, onFlatClick, userFlatId }: { 
  position: [number, number, number], 
  wing: string, 
  flats: any[], 
  onFlatClick: (flat: any) => void,
  userFlatId: string | undefined
}) => {
  return (
    <group position={position}>
      {/* Building Base */}
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 8, 4]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>
      
      {/* Wing Label */}
      <Text
        position={[0, 9, 0]}
        fontSize={1}
        color="#c2410c"
        anchorX="center"
        anchorY="middle"
      >
        Wing {wing}
      </Text>

      {/* Flats on the building surface */}
      {flats.map((flat, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const xPos = col === 0 ? -1.2 : 1.2;
        const yPos = row * 2 + 1;
        const isUserFlat = userFlatId === flat.id;
        
        return (
          <FlatBox 
            key={flat.id} 
            position={[xPos, yPos, 2.1]} 
            flat={flat} 
            isUserFlat={isUserFlat}
            onClick={() => onFlatClick(flat)}
          />
        );
      })}
    </group>
  );
};

const FlatBox = ({ position, flat, onClick, isUserFlat }: { 
  position: [number, number, number], 
  flat: any, 
  onClick: () => void,
  isUserFlat: boolean
}) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const color = useMemo(() => {
    if (isUserFlat) return "#f97316"; // Primary Orange
    if (flat.is_claimed) return "#0d9488"; // Teal
    return "#94a3b8"; // Muted Slate
  }, [flat.is_claimed, isUserFlat]);

  return (
    <mesh 
      position={position} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      castShadow
    >
      <boxGeometry args={[1.5, 1.2, 0.5]} />
      <meshStandardMaterial 
        color={color} 
        emissive={hovered ? color : "black"} 
        emissiveIntensity={hovered ? 0.5 : 0}
      />
      <Text
        position={[0, 0, 0.26]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {flat.flat_number}
      </Text>
    </mesh>
  );
};

const NoticeBoard3D = ({ onClick }: { onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group 
      position={[0, 1, 6]} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow>
        <boxGeometry args={[3, 2, 0.2]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[0.2, 2, 0.2]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <Text
        position={[0, 0, 0.11]}
        fontSize={0.3}
        color="#1f2937"
        anchorX="center"
        anchorY="middle"
      >
        SOCIETY NOTICES
      </Text>
      {hovered && (
        <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[0, 1.5, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
          </mesh>
        </Float>
      )}
    </group>
  );
};

const MeetingHall3D = ({ onClick }: { onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group 
      position={[6, 1, 0]} 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh castShadow>
        <cylinderGeometry args={[3, 3, 2, 6]} />
        <meshStandardMaterial color="#0d9488" opacity={0.8} transparent />
      </mesh>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        MEETING HALL
      </Text>
    </group>
  );
};

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
      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={50} />
      <OrbitControls 
        enablePan={true} 
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={10} 
        maxDistance={40} 
        autoRotate={false}
      />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <directionalLight position={[-10, 20, 10]} intensity={1.5} castShadow />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#fdfbf7" />
      </mesh>
      <gridHelper args={[100, 50, "#e5e7eb", "#f3f4f6"]} position={[0, 0, 0]} />

      {/* Buildings */}
      <Building 
        position={[-8, 0, -8]} 
        wing="A" 
        flats={buildings["A"] || []} 
        onFlatClick={onFlatClick} 
        userFlatId={userFlatId}
      />
      <Building 
        position={[0, 0, -12]} 
        wing="B" 
        flats={buildings["B"] || []} 
        onFlatClick={onFlatClick} 
        userFlatId={userFlatId}
      />
      <Building 
        position={[8, 0, -8]} 
        wing="C" 
        flats={buildings["C"] || []} 
        onFlatClick={onFlatClick} 
        userFlatId={userFlatId}
      />

      {/* Common Areas */}
      <NoticeBoard3D onClick={onNoticeBoardClick} />
      <MeetingHall3D onClick={onMeetingHallClick} />

      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} far={4.5} />
      <Environment preset="city" />
    </>
  );
};

const ThreeSocietyMap = () => {
  const { flats, loading, claimFlat } = useFlats();
  const { user, flat: userFlat } = useAuth();
  const [selectedFlat, setSelectedFlat] = useState<any | null>(null);
  const [claimingFlat, setClaimingFlat] = useState<string | null>(null);
  const navigate = useNavigate();

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
      <div className="h-[600px] flex items-center justify-center bg-society-cream/50 rounded-3xl border border-border">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="py-16 bg-society-cream/50" id="map">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
            3D Living Society
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Interactive Society Map
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Welcome to the 3D world of Gokuldham. Click on buildings to view flats, 
            or visit the central notice board and meeting hall.
          </p>
        </div>

        <div className="h-[600px] w-full bg-card rounded-3xl border border-border shadow-elevated overflow-hidden relative group">
          <Canvas shadows>
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
          
          <div className="absolute bottom-6 right-6 p-4 bg-background/80 backdrop-blur-md rounded-2xl border border-border shadow-card pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs font-bold uppercase tracking-wider mb-2">Controls</p>
            <ul className="text-[10px] space-y-1 text-muted-foreground">
              <li>• Left Click: Rotate</li>
              <li>• Right Click: Pan</li>
              <li>• Scroll: Zoom</li>
              <li>• Click Objects to interact</li>
            </ul>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-12 p-6 bg-card/50 rounded-2xl border border-border/50 max-w-2xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-[#0d9488]" />
            <span className="text-sm font-medium text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-[#94a3b8]" />
            <span className="text-sm font-medium text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-[#f97316]" />
            <span className="text-sm font-medium text-muted-foreground">Your Flat</span>
          </div>
        </div>

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
                        {claimingFlat === selectedFlat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Claim Flat"}
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

export default ThreeSocietyMap;
