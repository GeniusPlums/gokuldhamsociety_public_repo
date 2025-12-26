import React, { useState } from 'react';
import { TargetType, ContributionType, ConfidenceLevel } from '@/types/contributions';
import { useContributions } from '@/hooks/useContributions';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ScrollArea } from './ui/scroll-area';
import { PencilLine, BookOpen, AlertCircle, Sparkles, Info } from 'lucide-react';

interface ContributionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: TargetType;
  targetId?: string | null;
  targetTitle?: string;
}

export const ContributionPanel = ({
  isOpen,
  onClose,
  targetType,
  targetId = null,
  targetTitle = 'New Entry'
}: ContributionPanelProps) => {
  const [step, setStep] = useState(1);
  const [contributionType, setContributionType] = useState<ContributionType>('new_entry');
  const [content, setContent] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [confidence, setConfidence] = useState<ConfidenceLevel>('fairly_sure');
  
  const { submitContribution, loading } = useContributions();

  const handleSubmit = async () => {
    const success = await submitContribution({
      target_type: targetType,
      target_id: targetId,
      contribution_type: contributionType,
      content: { text: content },
      reason,
      reference,
      confidence_level: confidence
    });

    if (success) {
      onClose();
      setStep(1);
      setContent('');
      setReason('');
      setReference('');
    }
  };

  const contributionTypes = [
    { id: 'new_entry', label: 'New Entry', icon: Sparkles, desc: 'Add something entirely new' },
    { id: 'correction', label: 'Correction', icon: AlertCircle, desc: 'Fix an error or inaccuracy' },
    { id: 'expansion', label: 'Expansion', icon: BookOpen, desc: 'Add more depth or detail' },
    { id: 'clarification', label: 'Clarification', icon: PencilLine, desc: 'Make existing info clearer' }
  ];

  const getExample = () => {
    if (targetType === 'dynamic') return 'Example: "Jetha–Sodhi dynamic peaked during the Chandaramani flat arc because..."';
    if (targetType === 'record') return 'Example: "In this episode, the chemistry between the ladies during the kitty party was particularly..."';
    if (targetType === 'arc') return 'Example: "This arc is significant because it introduced the first major society-wide conflict regarding..."';
    return 'Be descriptive and factual.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-society-cream border-primary/20">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-2xl font-display">
            <PencilLine className="w-5 h-5 text-primary" />
            Suggest to {targetType.charAt(0).toUpperCase() + targetType.slice(1)}s
          </DialogTitle>
          <DialogDescription className="font-medium text-muted-foreground">
            {targetId ? (
              <>Refining <span className="text-primary font-bold">{targetTitle}</span></>
            ) : (
              `Proposing a new ${targetType} entry`
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <Label className="text-base font-bold text-foreground">What kind of contribution is this?</Label>
              <div className="grid grid-cols-1 gap-3">
                {contributionTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setContributionType(t.id as ContributionType);
                      setStep(2);
                    }}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left group ${
                      contributionType === t.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <div className="mt-1 p-2 rounded-lg bg-background border border-border shadow-sm group-hover:border-primary/50 transition-colors">
                      <t.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <Label className="font-bold">Proposed Content</Label>
                <Textarea
                  placeholder={getExample()}
                  className="min-h-[120px] bg-background border-border focus:border-primary"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Reason / Context</Label>
                <Textarea
                  placeholder="Why does this improve accuracy or depth? (Sources help!)"
                  className="bg-background border-border focus:border-primary"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Reference</Label>
                <Input
                  placeholder="Episode number(s) or arc names"
                  className="bg-background border-border focus:border-primary"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label className="font-bold">Confidence Level</Label>
                <RadioGroup 
                  value={confidence} 
                  onValueChange={(v) => setConfidence(v as ConfidenceLevel)}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-lg border-2 bg-background p-2 hover:border-primary/30 cursor-pointer">
                    <RadioGroupItem value="certain" id="certain" />
                    <Label htmlFor="certain" className="text-xs cursor-pointer font-bold">Certain</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border-2 bg-background p-2 hover:border-primary/30 cursor-pointer">
                    <RadioGroupItem value="fairly_sure" id="fairly_sure" />
                    <Label htmlFor="fairly_sure" className="text-xs cursor-pointer font-bold">Fairly sure</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border-2 bg-background p-2 hover:border-primary/30 cursor-pointer">
                    <RadioGroupItem value="from_memory" id="from_memory" />
                    <Label htmlFor="from_memory" className="text-xs cursor-pointer font-bold">Memory</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 text-xs">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-bold text-primary">Guidance:</span> Clear reasoning beats long text. High-quality contributions are approved faster.
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-6 pt-0 flex items-center justify-between border-t border-border/50 bg-muted/30">
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)} disabled={loading} className="font-bold">
              Back
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose} disabled={loading} className="font-bold border-2">
              Cancel
            </Button>
            {step === 2 && (
              <Button onClick={handleSubmit} disabled={loading || !content || !reason} className="font-bold shadow-lg shadow-primary/20">
                {loading ? 'Submitting...' : 'Submit Note'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
