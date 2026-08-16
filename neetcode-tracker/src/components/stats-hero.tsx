"use client";
import { useEffect, useState } from "react";
import { fetchStats, type Stats } from "@/lib/api";

export function StatsHero() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="h-32 animate-pulse rounded-xl bg-card" />;

  const categories = Object.entries(stats.byCategory);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Mastered
          </p>
          <p className="font-display text-4xl font-bold">
            {stats.mastered}
            <span className="text-lg text-muted-foreground">
              {" "}
              / {stats.total}
            </span>
          </p>
        </div>
        <div className="text-right font-mono text-xs text-muted-foreground">
          <p>
            <span className="text-primary">{stats.due}</span> due for review
          </p>
          <p>
            {stats.learning} in progress · {stats.new} not started
          </p>
        </div>
      </div>

      <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {categories.map(([name, c]) => (
          <div
            key={name}
            className="h-full border-r border-background/40 last:border-none"
            style={{ width: `${(c.total / stats.total) * 100}%` }}
            title={`${name}: ${c.mastered}/${c.total} mastered`}
          >
            <div
              className="h-full bg-primary"
              style={{
                width: `${c.total ? (c.mastered / c.total) * 100 : 0}%`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
