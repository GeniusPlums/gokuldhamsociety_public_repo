import { describe, it, expect } from "vitest";
import { calculateCharacterScore } from "./characterSelection";

describe("calculateCharacterScore", () => {
  it("calculates correct score with high support and good metrics", () => {
    const metrics = {
      supportCount: 50,
      opposeCount: 0,
      reputationScore: 80,
      trustScore: 90,
    };
    
    // normalizedSupport = (50/50)*100 = 100
    // score = (100 * 0.5) + (80 * 0.3) + (90 * 0.2)
    // score = 50 + 24 + 18 = 92
    expect(calculateCharacterScore(metrics)).toBe(92);
  });

  it("calculates correct score with mixed support", () => {
    const metrics = {
      supportCount: 30,
      opposeCount: 10,
      reputationScore: 60,
      trustScore: 50,
    };
    
    // communitySupport = 20
    // normalizedSupport = (20/50)*100 = 40
    // score = (40 * 0.5) + (60 * 0.3) + (50 * 0.2)
    // score = 20 + 18 + 10 = 48
    expect(calculateCharacterScore(metrics)).toBe(48);
  });

  it("returns 0 if oppose exceeds support and other metrics are 0", () => {
    const metrics = {
      supportCount: 10,
      opposeCount: 20,
      reputationScore: 0,
      trustScore: 0,
    };
    
    expect(calculateCharacterScore(metrics)).toBe(0);
  });

  it("caps normalized support at 100", () => {
    const metrics = {
      supportCount: 100, // normalized would be 200 without cap
      opposeCount: 0,
      reputationScore: 100,
      trustScore: 100,
    };
    
    // normalizedSupport capped at 100
    // score = (100 * 0.5) + (100 * 0.3) + (100 * 0.2) = 100
    expect(calculateCharacterScore(metrics)).toBe(100);
  });
});
