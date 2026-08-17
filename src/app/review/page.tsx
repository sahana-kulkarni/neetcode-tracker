"use client";
import { useEffect, useState } from "react";
import { fetchProblems, logAttempt, type Problem } from "@/lib/api";
import { QualityDialog } from "@/components/quality-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DIFFICULTY_CLASS: Record<string, string> = {
  Easy: "text-easy border-easy/40",
  Medium: "text-medium border-medium/40",
  Hard: "text-hard border-hard/40",
};

export default function ReviewPage() {
  const [due, setDue] = useState<Problem[]>([]);
  const [upNext, setUpNext] = useState<Problem[]>([]);
  const [active, setActive] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [dueList, newList] = await Promise.all([
      fetchProblems({ due: true }),
      fetchProblems({ status: "new" }),
    ]);
    setDue(dueList);
    setUpNext(newList.slice(0, 5));
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleSubmit(quality: 1 | 2 | 3 | 4, timeSeconds?: number) {
    if (!active) return;
    const updated = await logAttempt(active.id, quality, timeSeconds);
    setDue((q) => q.filter((p) => p.id !== active.id));
    setUpNext((q) => q.filter((p) => p.id !== active.id));
    setActive(null);
    toast(
      `${updated.title} → ${updated.status}, next review in ${updated.intervalDays}d`,
    );
  }

  if (loading)
    return (
      <p className="font-mono text-sm text-muted-foreground">Loading queue…</p>
    );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-xl font-bold">
          Review queue{" "}
          <span className="text-muted-foreground">({due.length})</span>
        </h1>
        {due.length === 0 ? (
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            Nothing due for review yet — this fills up once you&apos;ve logged
            attempts and their intervals come around.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {due.map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p)}
                className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-card p-4 text-left transition hover:border-primary"
              >
                <div>
                  <p className="font-display font-medium">{p.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {p.category}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={DIFFICULTY_CLASS[p.difficulty]}
                >
                  {p.difficulty}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-sm font-semibold text-muted-foreground">
          Up next in the roadmap
        </h2>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          Not scheduled reviews — just the next unstarted problems in order.
          Solve on LeetCode, then log it here.
        </p>
        <div className="mt-3 space-y-2">
          {upNext.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className="flex w-full items-center justify-between rounded-lg border border-border/40 border-dashed bg-card/50 p-3 text-left transition hover:border-primary"
            >
              <div>
                <p className="font-display text-sm font-medium">{p.title}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {p.category}
                </p>
              </div>
              <Badge
                variant="outline"
                className={DIFFICULTY_CLASS[p.difficulty]}
              >
                {p.difficulty}
              </Badge>
            </button>
          ))}
        </div>
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
