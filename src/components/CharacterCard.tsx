import { Character } from "@/types/characters";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Star, Clock } from "lucide-react";

interface CharacterCardProps {
  character: Character;
  onApply: (character: Character) => void;
  currentUserAssignment?: any;
}

export function CharacterCard({ character, onApply, currentUserAssignment }: CharacterCardProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'CORE': return 'bg-purple-500 hover:bg-purple-600';
      case 'REGULAR': return 'bg-blue-500 hover:bg-blue-600';
      case 'EVENT': return 'bg-orange-500 hover:bg-orange-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return <Badge variant="outline" className="text-green-500 border-green-500">Available</Badge>;
      case 'ACTIVE': return <Badge variant="outline" className="text-blue-500 border-blue-500">Active</Badge>;
      case 'COOLDOWN': return <Badge variant="outline" className="text-orange-500 border-orange-500">Cooldown</Badge>;
      default: return null;
    }
  };

  return (
    <Card className="overflow-hidden border-2 transition-all hover:shadow-lg">
      <div className="h-48 bg-muted relative">
        {character.image_url ? (
          <img src={character.image_url} alt={character.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <User size={64} className="text-primary/40" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
          <Badge className={getTierColor(character.tier)}>{character.tier}</Badge>
          {getStatusBadge(character.status)}
        </div>
      </div>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {character.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {character.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={14} />
            <span>{character.tenure_days} Days Tenure</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Star size={14} />
            <span>{character.min_endorsements} Endorsements</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Shield size={14} />
            <span>{character.min_trust_score} Trust Score</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={character.status === 'AVAILABLE' ? 'default' : 'secondary'}
          disabled={character.status !== 'AVAILABLE'}
          onClick={() => onApply(character)}
        >
          {character.status === 'AVAILABLE' ? 'Apply for Role' : 'Role Occupied'}
        </Button>
      </CardFooter>
    </Card>
  );
}
