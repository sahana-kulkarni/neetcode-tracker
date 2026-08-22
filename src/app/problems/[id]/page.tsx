"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchProblemDetail,
  updateProblem,
  type ProblemDetail,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const DIFFICULTY_CLASS: Record<string, string> = {
  Easy: "text-easy border-easy/40",
  Medium: "text-medium border-medium/40",
  Hard: "text-hard border-hard/40",
};

const QUALITY_LABEL: Record<number, { label: string; tone: string }> = {
  1: { label: "Blanked", tone: "text-hard" },
  2: { label: "Slow / hint", tone: "text-medium" },
  3: { label: "Solved", tone: "text-secondary" },
  4: { label: "Fast & confident", tone: "text-primary" },
};

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchProblemDetail(Number(id)).then((p) => {
      setProblem(p);
      setNotes(p.notes ?? "");
    });
  }, [id]);

  async function saveNotes() {
    if (!problem) return;
    setSavingNotes(true);
    const updated = await updateProblem(problem.id, { notes });
    setProblem((p) => (p ? { ...p, notes: updated.notes } : p));
    setSavingNotes(false);
  }

  if (!problem)
    return <p className="font-mono text-sm text-muted-foreground">Loading…</p>;

  const masteryPct = Math.min(
    100,
    Math.round((problem.intervalDays / 60) * 100),
  );

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.back()}
        className="font-mono text-xs text-muted-foreground hover:text-foreground"
      >
        ← back
      </button>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{problem.title}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {problem.category}
          </p>
        </div>
        <Badge
          variant="outline"
          className={DIFFICULTY_CLASS[problem.difficulty]}
        >
          {problem.difficulty}
        </Badge>
      </div>

      <a
        href={problem.leetcodeUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block font-mono text-xs text-primary hover:underline"
      >
        open on leetcode ↗
      </a>

      <div className="mt-6 rounded-xl border border-border/60 bg-card p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Status
            </p>
            <p className="font-display text-sm font-semibold capitalize">
              {problem.status}
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Attempts
            </p>
            <p className="font-display text-sm font-semibold">
              {problem.reviewCount}
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Current interval
            </p>
            <p className="font-display text-sm font-semibold">
              {problem.intervalDays}d
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {problem.status === "mastered"
                ? "Mastered"
                : "Est. attempts to mastery"}
            </p>
            <p className="font-display text-sm font-semibold">
              {problem.status === "mastered"
                ? "✓"
                : `~${problem.attemptsToMastery} more`}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>Mastery progress</span>
            <span>{masteryPct}%</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>
        {problem.status !== "mastered" && (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            Estimate assumes you keep rating attempts &quot;fast &amp;
            confident&quot; going forward — a rougher attempt pushes this out.
          </p>
        )}
      </div>

      <div className="mt-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Your notes on this problem
        </p>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          A permanent note, separate from attempt history below — good for a
          pattern reminder, e.g. &quot;use a monotonic stack.&quot;
        </p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-2 min-h-[80px] font-mono text-xs"
        />
        <Button
          size="sm"
          className="mt-2"
          onClick={saveNotes}
          disabled={savingNotes}
        >
          {savingNotes ? "Saving…" : "Save note"}
        </Button>
      </div>

      <div className="mt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Attempt history
        </p>
        {problem.attempts.length === 0 ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            No attempts logged yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {problem.attempts.map((a) => {
              const q = QUALITY_LABEL[a.quality];
              return (
                <div
                  key={a.id}
                  className="rounded-lg border border-border/60 bg-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-display text-sm font-semibold ${q.tone}`}
                    >
                      {q.label}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {new Date(a.attemptedAt).toLocaleDateString()}
                      {a.timeSeconds
                        ? ` · ${Math.round(a.timeSeconds / 60)}m`
                        : ""}
                    </span>
                  </div>
                  {a.notes && (
                    <p className="mt-1.5 font-mono text-xs text-muted-foreground">
                      {a.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
