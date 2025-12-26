import React, { useState, useEffect } from "react";
import { Compass, Sparkles, BookOpen, Users, History, PlusCircle, MonitorOff, Monitor } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const GuidedExploration = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLowEndMode, setIsLowEndMode] = useState(() => {
    return localStorage.getItem("lowEndMode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("lowEndMode", isLowEndMode.toString());
    window.dispatchEvent(new CustomEvent("lowEndModeChange", { detail: isLowEndMode }));
  }, [isLowEndMode]);

  const prompts = [
    {
      title: "Explore iconic character dynamics",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      action: () => {
        const notices = document.getElementById("wiki");
        if (notices) {
          notices.scrollIntoView({ behavior: "smooth" });
          const dynSection = document.getElementById("dynamics");
          if (dynSection) dynSection.scrollIntoView({ behavior: "smooth" });
        }
        setIsOpen(false);
      },
    },
    {
      title: "Relive major story arcs",
      icon: <History className="h-5 w-5 text-orange-500" />,
      action: () => {
        const notices = document.getElementById("wiki");
        if (notices) {
          notices.scrollIntoView({ behavior: "smooth" });
          const arcSection = document.getElementById("arcs");
          if (arcSection) arcSection.scrollIntoView({ behavior: "smooth" });
        }
        setIsOpen(false);
      },
    },
    {
      title: "See how the society evolved",
      icon: <Sparkles className="h-5 w-5 text-yellow-500" />,
      action: () => {
        const map = document.getElementById("map");
        if (map) {
          map.scrollIntoView({ behavior: "smooth" });
        }
        setIsOpen(false);
      },
    },
    {
      title: "Add a community contribution",
      icon: <PlusCircle className="h-5 w-5 text-green-500" />,
      action: () => {
        window.dispatchEvent(new CustomEvent("openContributionPanel"));
        setIsOpen(false);
      },
    },
  ];

  return (
    <>
      <div className="fixed bottom-8 left-8 z-[90]">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 px-6 gap-2 shadow-2xl border-2 border-primary/20 bg-background/80 backdrop-blur-md hover:bg-background transition-all group"
          variant="outline"
        >
          <Compass className="h-6 w-6 text-primary group-hover:rotate-45 transition-transform" />
          <span className="font-display font-bold text-foreground">Explore Gokuldham</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-society-cream border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" />
              Guided Exploration
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-3 pt-4">
            {prompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={prompt.action}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                  {prompt.icon}
                </div>
                <span className="font-medium text-foreground">{prompt.title}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                {isLowEndMode ? <MonitorOff className="h-5 w-5 text-primary" /> : <Monitor className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <Label htmlFor="low-end-mode" className="font-bold cursor-pointer">Simplified View</Label>
                  <p className="text-[10px] text-muted-foreground">Reduces 3D detail for better performance</p>
                </div>
              </div>
              <Switch 
                id="low-end-mode" 
                checked={isLowEndMode} 
                onCheckedChange={setIsLowEndMode} 
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

