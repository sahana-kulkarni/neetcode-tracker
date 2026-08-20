"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Problem } from "@/lib/api";

const OPTIONS = [
  {
    quality: 1 as const,
    label: "Blanked",
    desc: "Needed the solution",
    tone: "text-hard",
  },
  {
    quality: 2 as const,
    label: "Slow / hint",
    desc: "Got there with help",
    tone: "text-medium",
  },
  {
    quality: 3 as const,
    label: "Solved",
    desc: "Not fast, but got it",
    tone: "text-secondary",
  },
  {
    quality: 4 as const,
    label: "Fast & confident",
    desc: "Recognized it immediately",
    tone: "text-primary",
  },
];

export function QualityDialog({
  problem,
  open,
  onOpenChange,
  onSubmit,
}: {
  problem: Problem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    quality: 1 | 2 | 3 | 4,
    timeSeconds?: number,
    notes?: string,
  ) => void;
}) {
  const [minutes, setMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [selected, setSelected] = useState<1 | 2 | 3 | 4 | null>(null);

  function reset() {
    setMinutes("");
    setNotes("");
    setSelected(null);
  }

  function handleOpenChange(o: boolean) {
    if (!o) reset();
    onOpenChange(o);
  }

  function handleLog() {
    if (!selected) return;
    onSubmit(
      selected,
      minutes ? Number(minutes) * 60 : undefined,
      notes.trim() || undefined,
    );
    reset();
  }

  if (!problem) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="font-display">
        <DialogHeader>
          <DialogTitle>{problem.title}</DialogTitle>
        </DialogHeader>
        <p className="font-mono text-xs text-muted-foreground">
          How did that attempt go?
        </p>
        <div className="grid grid-cols-2 gap-2 py-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.quality}
              onClick={() => setSelected(opt.quality)}
              className={`rounded-lg border p-3 text-left transition ${
                selected === opt.quality
                  ? "border-primary bg-accent"
                  : "border-border/60 bg-accent/40 hover:border-primary hover:bg-accent"
              }`}
            >
              <p className={`font-display text-sm font-semibold ${opt.tone}`}>
                {opt.label}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {opt.desc}
              </p>
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-xs text-muted-foreground">
            Notes (optional) — what hint did you use, what tripped you up?
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. peeked at my array notes for the two-pointer approach"
            className="min-h-[70px] font-mono text-xs"
          />
        </div>

        <DialogFooter className="items-center gap-2 sm:justify-between">
          <div className="flex items-center gap-2">
            <label className="font-mono text-xs text-muted-foreground">
              Minutes taken
            </label>
            <Input
              type="number"
              min={0}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="w-20"
            />
          </div>
          <Button onClick={handleLog} disabled={!selected}>
            Log attempt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
