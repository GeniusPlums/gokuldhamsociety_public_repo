import { useState } from "react";
import { Character } from "@/types/characters";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ApplyCharacterDialogProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string | undefined;
}

export function ApplyCharacterDialog({ character, isOpen, onClose, onSuccess, userId }: ApplyCharacterDialogProps) {
  const [statement, setStatement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!character || !userId) return;
    if (!statement.trim()) {
      toast.error("Please provide a statement for your application.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Check eligibility (simplified for now, backend triggers or RPC would be better)
      const { data: profile } = await supabase
        .from('profiles')
        .select('endorsement_count, trust_score, created_at')
        .eq('id', userId)
        .single();

      if (!profile) throw new Error("Profile not found");

      const accountAgeDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));

      if (profile.endorsement_count < character.min_endorsements) {
        toast.error(`You need at least ${character.min_endorsements} endorsements.`);
        return;
      }
      if (profile.trust_score < character.min_trust_score) {
        toast.error(`You need a trust score of at least ${character.min_trust_score}.`);
        return;
      }
      if (accountAgeDays < character.min_account_age_days) {
        toast.error(`Your account must be at least ${character.min_account_age_days} days old.`);
        return;
      }

      // 2. Submit application
      const { error } = await supabase
        .from('character_applications')
        .insert({
          character_id: character.id,
          user_id: userId,
          statement: statement
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You already have a pending application for this character.");
        } else {
          throw error;
        }
      } else {
        toast.success("Application submitted successfully! The society will now review it.");
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply for {character?.name}</DialogTitle>
          <DialogDescription>
            Tell the society why you are the best fit for this iconic role. In-character statements are encouraged!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="statement">Your Statement</Label>
            <Textarea
              id="statement"
              placeholder="E.g. Hey Maa Mataji! I will bring joy and garba to everyone in the society..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <div className="bg-muted p-3 rounded-md text-xs space-y-1">
            <p className="font-semibold">Requirements:</p>
            <ul className="list-disc list-inside opacity-80">
              <li>{character?.min_endorsements} Endorsements</li>
              <li>{character?.min_trust_score} Trust Score</li>
              <li>{character?.min_account_age_days} Days Account Age</li>
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
