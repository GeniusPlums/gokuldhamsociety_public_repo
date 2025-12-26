export type CharacterTier = 'CORE' | 'REGULAR' | 'EVENT';
export type CharacterStatus = 'AVAILABLE' | 'ACTIVE' | 'COOLDOWN';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AssignmentStatus = 'ACTIVE' | 'ENDED' | 'REVOKED';

export interface Character {
  id: string;
  name: string;
  tier: CharacterTier;
  description: string;
  default_powers: string[];
  tenure_days: number;
  status: CharacterStatus;
  min_endorsements: number;
  min_trust_score: number;
  min_account_age_days: number;
  image_url?: string;
  created_at: string;
}

export interface CharacterApplication {
  id: string;
  character_id: string;
  user_id: string;
  statement: string;
  status: ApplicationStatus;
  support_count: number;
  oppose_count: number;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
}

export interface CharacterAssignment {
  id: string;
  character_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  performance_score: number;
  status: AssignmentStatus;
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
  characters?: Character;
}
