import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export const ValueFraming = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenFraming = localStorage.getItem("hasSeenFraming");
    if (!hasSeenFraming) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000); // Show after 1 second
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("hasSeenFraming", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card/95 backdrop-blur-sm border border-primary/20 p-4 rounded-xl shadow-2xl relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-sm md:text-base text-foreground leading-relaxed pr-6">
          Explore and collectively document the world of Gokuldham Society —{" "}
          <span className="font-semibold text-primary">episodes, story arcs, and iconic character dynamics.</span>
        </p>
      </div>
    </div>
  );
};
