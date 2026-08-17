"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  fetchProblems,
  updateProblem,
  logAttempt,
  type Problem,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { QualityDialog } from "@/components/quality-dialog";
import { toast } from "sonner";

const DIFFICULTY_CLASS: Record<string, string> = {
  Easy: "text-easy border-easy/40",
  Medium: "text-medium border-medium/40",
  Hard: "text-hard border-hard/40",
};

const STATUS_LABEL: Record<string, string> = {
  new: "not started",
  learning: "learning",
  mastered: "mastered",
};

function ProblemsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryFilter = searchParams.get("category") ?? "";
  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Problem | null>(null);

  useEffect(() => {
    fetchProblems({ category: categoryFilter || undefined }).then(setProblems);
  }, [categoryFilter]);

  const filtered = useMemo(
    () =>
      problems.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [problems, search],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Problem[]>();
    for (const p of filtered) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return map;
  }, [filtered]);

  async function toggleStar(p: Problem) {
    const updated = await updateProblem(p.id, { starred: !p.starred });
    setProblems((all) => all.map((x) => (x.id === p.id ? updated : x)));
  }

  async function handleSubmit(quality: 1 | 2 | 3 | 4, timeSeconds?: number) {
    if (!active) return;
    const updated = await logAttempt(active.id, quality, timeSeconds);
    setProblems((all) => all.map((x) => (x.id === updated.id ? updated : x)));
    setActive(null);
    toast(
      `${updated.title} → ${updated.status}, next review in ${updated.intervalDays}d`,
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-xl font-bold">
          {categoryFilter || "All problems"}
        </h1>
        {categoryFilter && (
          <button
            onClick={() => router.push("/problems")}
            className="font-mono text-xs text-muted-foreground hover:text-foreground"
          >
            clear filter ×
          </button>
        )}
      </div>
      <Input
        placeholder="Search problems…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-4 max-w-sm"
      />

      <div className="mt-6 space-y-8">
        {[...grouped.entries()].map(([category, items]) => (
          <div key={category}>
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {category}
            </h2>
            <div className="mt-2 divide-y divide-border/60 rounded-lg border border-border/60 bg-card">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStar(p)}
                      className={`text-lg ${p.starred ? "text-primary" : "text-muted-foreground/40"}`}
                      aria-label="Star for review"
                    >
                      ★
                    </button>
                    <a
                      href={p.leetcodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-display text-sm font-medium hover:text-primary"
                    >
                      {p.title}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActive(p)}
                      className="font-mono text-[11px] text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-primary"
                    >
                      {STATUS_LABEL[p.status]} · log attempt
                    </button>
                    <Badge
                      variant="outline"
                      className={DIFFICULTY_CLASS[p.difficulty]}
                    >
                      {p.difficulty}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <QualityDialog
        problem={active}
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense
      fallback={
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      }
    >
      <ProblemsList />
    </Suspense>
  );
}
