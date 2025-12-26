import React, { useState } from 'react';
import { useWikiData } from '@/hooks/useWikiData';
import { ContributionPanel } from './ContributionPanel';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TargetType } from '@/types/contributions';
import { PencilLine, ShieldCheck, Info, ChevronRight, BookOpen, Users, Layers, Star, PlayCircle, Link2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export const WikiSections = () => {
  const { episodes, dynamics, arcs, loading } = useWikiData();
  const [activePanel, setActivePanel] = useState<{ type: TargetType; id?: string; title?: string } | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ type: TargetType; item: any } | null>(null);

  if (loading) return <div className="p-8 text-center">Loading community records...</div>;

  const SectionHeader = ({ title, icon: Icon, type }: { title: string; icon: any; type: TargetType }) => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <Icon className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-display font-bold">{title}</h2>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2 border-primary/20 hover:bg-primary/5"
        onClick={() => setActivePanel({ type })}
      >
        <PencilLine className="w-4 h-4" />
        Add {type.charAt(0).toUpperCase() + type.slice(1)}
      </Button>
    </div>
  );

  return (
    <div className="space-y-24 py-20 bg-background">
      <div className="container max-w-6xl">
        {/* Explanation Line */}
        <div className="mb-12 p-4 rounded-xl bg-accent/50 border border-border flex items-center gap-3 text-sm">
          <Info className="w-5 h-5 text-primary" />
          <p className="font-medium">
            Additions are community-reviewed before appearing live. <span className="text-primary font-bold">Accuracy beats popularity.</span>
          </p>
        </div>

        {/* Dynamics - NOW FIRST */}
        <section id="dynamics" className="scroll-mt-24 mb-24">
          <SectionHeader title="Dynamics" icon={Users} type="dynamic" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dynamics.map((dyn) => (
              <WikiCard 
                key={dyn.id} 
                title={dyn.title}
                description={dyn.description}
                type="dynamic"
                onClick={() => setSelectedItem({ type: 'dynamic', item: dyn })}
                onEdit={(e: any) => {
                  e.stopPropagation();
                  setActivePanel({ type: 'dynamic', id: dyn.id, title: dyn.title });
                }}
              />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-primary gap-2"
              onClick={() => setActivePanel({ type: 'dynamic' })}
            >
              <PencilLine className="w-4 h-4" />
              Suggest an addition or correction
            </Button>
          </div>
        </section>

        {/* Arcs - NOW SECOND */}
        <section id="arcs" className="scroll-mt-24 mb-24">
          <SectionHeader title="Arcs" icon={Layers} type="arc" />
          <div className="grid grid-cols-1 gap-6">
            {arcs.map((arc) => (
              <WikiCard 
                key={arc.id} 
                title={arc.title}
                description={arc.description}
                type="arc"
                onClick={() => setSelectedItem({ type: 'arc', item: arc })}
                onEdit={(e: any) => {
                  e.stopPropagation();
                  setActivePanel({ type: 'arc', id: arc.id, title: arc.title });
                }}
                metadata={`Episodes ${arc.start_episode} - ${arc.end_episode || 'Ongoing'}`}
              />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-primary gap-2"
              onClick={() => setActivePanel({ type: 'arc' })}
            >
              <PencilLine className="w-4 h-4" />
              Suggest an addition or correction
            </Button>
          </div>
        </section>

        {/* Records (Episodes) - NOW THIRD */}
        <section id="records" className="scroll-mt-24">
          <SectionHeader title="Records (Episodes)" icon={BookOpen} type="record" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes.map((ep) => (
              <WikiCard 
                key={ep.id} 
                title={`Ep ${ep.episode_number}: ${ep.title}`}
                description={ep.description}
                type="record"
                onClick={() => setSelectedItem({ type: 'record', item: ep })}
                onEdit={(e: any) => {
                  e.stopPropagation();
                  setActivePanel({ type: 'record', id: ep.id, title: ep.title });
                }}
              />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-primary gap-2"
              onClick={() => setActivePanel({ type: 'record' })}
            >
              <PencilLine className="w-4 h-4" />
              Suggest an addition or correction
            </Button>
          </div>
        </section>
      </div>

      {selectedItem && (
        <WikiDetailDialog 
          isOpen={!!selectedItem} 
          onClose={() => setSelectedItem(null)} 
          type={selectedItem.type} 
          item={selectedItem.item} 
        />
      )}

      {activePanel && (
        <ContributionPanel
          isOpen={!!activePanel}
          onClose={() => setActivePanel(null)}
          targetType={activePanel.type}
          targetId={activePanel.id}
          targetTitle={activePanel.title}
        />
      )}
    </div>
  );
};

const WikiCard = ({ title, description, type, onEdit, onClick, metadata }: any) => (
  <Card 
    className="group relative overflow-hidden border-2 border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer"
    onClick={onClick}
  >
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <Badge variant="secondary" className="mb-2 text-[10px] uppercase tracking-widest px-2 py-0">
          {type === 'record' ? 'Episode' : type}
        </Badge>
        <div className="flex items-center gap-2">
          {metadata && <span className="text-[10px] font-bold text-muted-foreground uppercase">{metadata}</span>}
          <Badge variant="outline" className="text-[8px] border-primary/20 text-primary">Community Interpretation</Badge>
        </div>
      </div>
      <CardTitle className="text-xl font-display">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {description || "No description available yet. Be the first to add details!"}
      </p>
      
      <div className="pt-4 border-t border-border/50 flex items-center justify-between">
        <ContributionProvenance />
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onEdit}
        >
          Suggest Edit <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const WikiDetailDialog = ({ isOpen, onClose, type, item }: any) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-society-cream border-primary/20 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-[10px] tracking-widest uppercase">{type}</Badge>
            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary uppercase">Show Canon</Badge>
          </div>
          <DialogTitle className="text-3xl font-display font-bold">{item.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-6">
          <section>
            <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary mb-3">
              <Info className="w-4 h-4" />
              Overview
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              {item.description || "No overview available."}
            </p>
          </section>

          {type === 'dynamic' && (
            <>
              <section>
                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary mb-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Why it works
                </h4>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-sm text-foreground italic">
                    "This dynamic thrives on the perfect balance of mutual respect and constant, lighthearted friction. It's the core of Gokuldham's community spirit."
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-primary">
                    <ShieldCheck className="w-3 h-3" />
                    Community-verified interpretation
                  </div>
                </div>
              </section>

              <section>
                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary mb-3">
                  <PlayCircle className="w-4 h-4" />
                  Peak Moments
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold">•</span>
                    <span>Episode 452: The "Chandaramani Flat" negotiation.</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold">•</span>
                    <span>Episode 1205: The joint family dinner disaster.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary mb-3">
                  <Link2 className="w-4 h-4" />
                  Associated Arcs
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-background">Society Election Arc</Badge>
                  <Badge variant="outline" className="bg-background">Ganesh Utsav 2012</Badge>
                </div>
              </section>
            </>
          )}

          <div className="pt-6 border-t border-border/50">
            <div className="flex items-center justify-between">
              <ContributionProvenance />
              <p className="text-[10px] text-muted-foreground">Last updated Dec 26, 2025</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ContributionProvenance = () => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary cursor-help">
          <ShieldCheck className="w-3.5 h-3.5" />
          Community-verified
        </div>
      </TooltipTrigger>
      <TooltipContent className="p-3 max-w-[200px] space-y-1">
        <p className="font-bold text-xs">Verified Addition</p>
        <p className="text-[10px] text-muted-foreground">
          Based on community reviews for accuracy and depth.
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
