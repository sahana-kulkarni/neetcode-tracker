export type Quality = 1 | 2 | 3 | 4;
export type ReviewStatus = "new" | "learning" | "mastered";

export interface SchedulingState {
  easeFactor: number;
  intervalDays: number;
}

interface SchedulingResult extends SchedulingState {
  status: ReviewStatus;
  nextReviewAt: Date;
}

const MASTERED_THRESHOLD_DAYS = 60;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

export function schedule(
  { easeFactor, intervalDays }: SchedulingState,
  quality: Quality,
  now: Date = new Date(),
): SchedulingResult {
  let newInterval = intervalDays;
  let newEase = easeFactor;

  switch (quality) {
    case 1:
      newInterval = 1;
      newEase = Math.max(MIN_EASE, easeFactor - 0.2);
      break;
    case 2:
      newInterval =
        intervalDays === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
      newEase = Math.max(MIN_EASE, easeFactor - 0.15);
      break;
    case 3:
      newInterval =
        intervalDays === 0 ? 3 : Math.round(intervalDays * easeFactor);
      break;
    case 4:
      newInterval =
        intervalDays === 0 ? 4 : Math.round(intervalDays * easeFactor * 1.3);
      newEase = Math.min(MAX_EASE, easeFactor + 0.1);
      break;
  }

  const status: ReviewStatus =
    newInterval >= MASTERED_THRESHOLD_DAYS ? "mastered" : "learning";
  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return {
    easeFactor: newEase,
    intervalDays: newInterval,
    status,
    nextReviewAt,
  };
}

// Simulates future reviews assuming you keep rating "fast & confident,"
// to give a rough "N more solid attempts to mastery" estimate.
export function projectAttemptsToMastery(
  state: SchedulingState,
  assumedQuality: Quality = 4,
  maxIterations = 15,
): number {
  let current: SchedulingState = { ...state };
  for (let i = 1; i <= maxIterations; i++) {
    const result = schedule(current, assumedQuality);
    if (result.status === "mastered") return i;
    current = {
      easeFactor: result.easeFactor,
      intervalDays: result.intervalDays,
    };
  }
  return maxIterations;
}
