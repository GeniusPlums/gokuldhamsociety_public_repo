export type TargetType = 'record' | 'dynamic' | 'arc';
export type ContributionType = 'new_entry' | 'correction' | 'expansion' | 'clarification';
export type ConfidenceLevel = 'certain' | 'fairly_sure' | 'from_memory';
export type ContributionStatus = 'proposed' | 'community_review' | 'curator_approval' | 'published' | 'rejected';

export interface Contribution {
  id: string;
  user_id: string;
  target_type: TargetType;
  target_id: string | null;
  contribution_type: ContributionType;
  content: any;
  reason: string;
  reference: string;
  confidence_level: ConfidenceLevel;
  status: ContributionStatus;
  created_at: string;
  profiles?: {
    display_name: string;
  };
}

export interface Review {
  id: string;
  contribution_id: string;
  reviewer_id: string;
  accuracy_vote: 'yes' | 'no' | 'unsure';
  usefulness_vote: 'yes' | 'no' | 'unsure';
  created_at: string;
}
