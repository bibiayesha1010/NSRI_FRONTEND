import { DayData } from '@/models/types';

/**
 * Computes an NSRI (Neuroregulatory Status & Recovery Index) score for a day.
 * Returns a value between 0 and 100.
 *
 * Weights:
 *   Sleep quality & duration  – 25 pts
 *   Mood                      – 20 pts
 *   Hydration                 – 15 pts
 *   Exercise                  – 15 pts
 *   Stress (inverse)          – 15 pts
 *   Energy                    – 10 pts
 */
export function scoreDay(day: DayData): number {
  let score = 0;

  // Sleep (25 pts): optimal is 7-9 hours at quality 4-5
  const sleepDurationScore = Math.min(day.sleepHours / 8, 1); // 0-1
  const sleepQualityScore = day.sleepQuality ? (day.sleepQuality - 1) / 4 : 0.5; // 0-1
  score += ((sleepDurationScore + sleepQualityScore) / 2) * 25;

  // Mood (20 pts): 1-5 scale
  if (day.moodScore != null) {
    score += ((day.moodScore - 1) / 4) * 20;
  } else {
    score += 10; // neutral when not logged
  }

  // Hydration (15 pts): against goal
  const hydrationProgress = Math.min(day.waterMl / day.waterGoalMl, 1);
  score += hydrationProgress * 15;

  // Exercise (15 pts): optimal is 30 min
  const exerciseProgress = Math.min(day.exerciseMin / 30, 1);
  score += exerciseProgress * 15;

  // Stress (15 pts) – inverse: lower stress = higher score
  if (day.stressScore != null) {
    score += ((5 - day.stressScore) / 4) * 15;
  } else {
    score += 7.5; // neutral when not logged
  }

  // Energy (10 pts)
  if (day.energyScore != null) {
    score += ((day.energyScore - 1) / 4) * 10;
  } else {
    score += 5; // neutral when not logged
  }

  return Math.round(Math.min(Math.max(score, 0), 100));
}

/**
 * Returns a label for a given NSRI score.
 */
export function nsriLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Great';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Low';
}

/**
 * Returns a color key for a given NSRI score (maps to theme colors).
 */
export function nsriColor(score: number): string {
  if (score >= 85) return '#27AE60'; // exercise green
  if (score >= 70) return '#4F86C6'; // primary blue
  if (score >= 55) return '#F5A623'; // accent amber
  if (score >= 40) return '#E67E22'; // attention orange
  return '#E74C3C';                  // low red
}
