export interface SelectionMetrics {
  supportCount: number;
  opposeCount: number;
  reputationScore: number;
  trustScore: number;
}

/**
 * Calculates a weighted score for a character application.
 * Formula: (Community Support × 0.5) + (Reputation Score × 0.3) + (Trust Score × 0.2)
 * Community Support is normalized as (Support - Oppose).
 */
export const calculateCharacterScore = (metrics: SelectionMetrics): number => {
  const communitySupport = Math.max(0, metrics.supportCount - metrics.opposeCount);
  
  // Normalize community support to a 0-100 scale (assuming 100 is a very high support)
  const normalizedSupport = Math.min(100, (communitySupport / 50) * 100);
  
  const score = (normalizedSupport * 0.5) + 
                (metrics.reputationScore * 0.3) + 
                (metrics.trustScore * 0.2);
                
  return Math.round(score * 10) / 10; // Round to 1 decimal place
};
