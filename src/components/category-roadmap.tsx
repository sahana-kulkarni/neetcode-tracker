"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchStats, type Stats } from "@/lib/api";

export function CategoryRoadmap() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return null;

  return (
    <div className="mt-8 border-l border-border/60 pl-6">
      {Object.entries(stats.byCategory).map(([name, c]) => {
        const pct = c.total ? Math.round((c.mastered / c.total) * 100) : 0;
        return (
          <Link
            key={name}
            href={`/problems?category=${encodeURIComponent(name)}`}
            className="group relative block py-3"
          >
            <span className="absolute -left-[29px] top-4 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-medium group-hover:text-primary">
                {name}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {c.mastered}/{c.total} · {pct}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${pct}%` }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
