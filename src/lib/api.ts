export type Problem = {
  id: number;
  slug: string;
  order: number;
  title: string;
  category: string;
  difficulty: string;
  leetcodeUrl: string;
  status: "new" | "learning" | "mastered";
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  reviewCount: number;
  starred: boolean;
  notes: string | null;
};

export type CategoryStats = {
  total: number;
  mastered: number;
  learning: number;
  new: number;
};

export type Stats = {
  total: number;
  mastered: number;
  learning: number;
  new: number;
  due: number;
  byCategory: Record<string, CategoryStats>;
};

export async function fetchProblems(params?: {
  category?: string;
  status?: string;
  search?: string;
  due?: boolean;
}): Promise<Problem[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.status) qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  if (params?.due) qs.set("due", "true");

  const res = await fetch(`/api/problems?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load problems");
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch("/api/stats", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

export async function logAttempt(
  problemId: number,
  quality: 1 | 2 | 3 | 4,
  timeSeconds?: number,
  notes?: string,
): Promise<Problem> {
  const res = await fetch("/api/attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problemId, quality, timeSeconds, notes }),
  });
  if (!res.ok) throw new Error("Failed to log attempt");
  return res.json();
}

export async function updateProblem(
  id: number,
  data: { starred?: boolean; notes?: string },
): Promise<Problem> {
  const res = await fetch(`/api/problems/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update problem");
  return res.json();
}
