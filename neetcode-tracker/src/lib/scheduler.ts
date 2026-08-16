export type Quality = 1 | 2 | 3 | 4;
// 1 = blanked, 2 = slow/needed a hint, 3 = solved, 4 = solved fast & confident

export type ReviewStatus = "new" | "learning" | "mastered";

interface SchedulingState {
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
    case 1: // blanked
      newInterval = 1;
      newEase = Math.max(MIN_EASE, easeFactor - 0.2);
      break;
    case 2: // slow / needed a hint
      newInterval =
        intervalDays === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
      newEase = Math.max(MIN_EASE, easeFactor - 0.15);
      break;
    case 3: // solved, not fast
      newInterval =
        intervalDays === 0 ? 3 : Math.round(intervalDays * easeFactor);
      break;
    case 4: // solved fast & confident
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
