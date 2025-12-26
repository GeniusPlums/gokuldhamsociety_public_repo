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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ScrollArea } from './ui/scroll-area';
import { PencilLine, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <PencilLine className="w-5 h-5 text-primary" />
            Suggest to {targetType.charAt(0).toUpperCase() + targetType.slice(1)}s
          </DialogTitle>
          <DialogDescription>
            {targetId ? `Improving: ${targetTitle}` : 'Adding a new community note'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <Label className="text-base font-bold">Step 1: Contribution Type</Label>
              <div className="grid grid-cols-1 gap-3">
                {contributionTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setContributionType(t.id as ContributionType);
                      setStep(2);
                    }}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left hover:bg-primary/5 ${
                      contributionType === t.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="mt-1 p-2 rounded-lg bg-background border border-border shadow-sm">
                      <t.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.label}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <Label>Proposed Content</Label>
                <Textarea
                  placeholder="What would you like to add or change?"
                  className="min-h-[120px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Reason / Context</Label>
                <Textarea
                  placeholder="Why does this improve accuracy or depth?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Reference</Label>
                <Input
                  placeholder="Episode number(s) or arc names"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Confidence Level</Label>
                <RadioGroup 
                  value={confidence} 
                  onValueChange={(v) => setConfidence(v as ConfidenceLevel)}
                  className="grid grid-cols-3 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="certain" id="certain" />
                    <Label htmlFor="certain" className="text-xs cursor-pointer">Certain</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="fairly_sure" id="fairly_sure" />
                    <Label htmlFor="fairly_sure" className="text-xs cursor-pointer">Fairly sure</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-2 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="from_memory" id="from_memory" />
                    <Label htmlFor="from_memory" className="text-xs cursor-pointer">Memory</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-6 pt-0 flex items-center justify-between">
          {step === 2 && (
            <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>
              Back
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            {step === 2 && (
              <Button onClick={handleSubmit} disabled={loading || !content || !reason}>
                {loading ? 'Submitting...' : 'Submit Note'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper Input component if not available
const Input = ({ ...props }: any) => (
  <input
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    {...props}
  />
);
