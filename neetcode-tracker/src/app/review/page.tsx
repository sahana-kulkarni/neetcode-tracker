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
  const [queue, setQueue] = useState<Problem[]>([]);
  const [active, setActive] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setQueue(await fetchProblems({ due: true }));
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleSubmit(quality: 1 | 2 | 3 | 4, timeSeconds?: number) {
    if (!active) return;
    const updated = await logAttempt(active.id, quality, timeSeconds);
    setQueue((q) => q.filter((p) => p.id !== active.id));
    setActive(null);
    toast(`${updated.title} → next review in ${updated.intervalDays}d`);
  }

  if (loading)
    return (
      <p className="font-mono text-sm text-muted-foreground">Loading queue…</p>
    );

  if (queue.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-10 text-center">
        <p className="font-display text-lg font-semibold">
          Nothing due right now.
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          Check back later, or browse all problems to practice ahead of
          schedule.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold">
        Review queue{" "}
        <span className="text-muted-foreground">({queue.length})</span>
      </h1>
      <div className="mt-5 space-y-2">
        {queue.map((p) => (
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
            <Badge variant="outline" className={DIFFICULTY_CLASS[p.difficulty]}>
              {p.difficulty}
            </Badge>
          </button>
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
