import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Problem } from "@prisma/client";

type CategoryStats = {
  total: number;
  mastered: number;
  learning: number;
  new: number;
};

export async function GET() {
  const problems: Problem[] = await prisma.problem.findMany();
  const now = new Date();

  const total = problems.length;
  const mastered = problems.filter(
    (p: Problem) => p.status === "mastered",
  ).length;
  const learning = problems.filter(
    (p: Problem) => p.status === "learning",
  ).length;
  const fresh = problems.filter((p: Problem) => p.status === "new").length;
  const due = problems.filter(
    (p: Problem) => p.nextReviewAt !== null && p.nextReviewAt <= now,
  ).length;

  const byCategory: Record<string, CategoryStats> = {};

  for (const p of problems) {
    if (!byCategory[p.category]) {
      byCategory[p.category] = { total: 0, mastered: 0, learning: 0, new: 0 };
    }
    byCategory[p.category].total += 1;
    const key = p.status as "mastered" | "learning" | "new";
    byCategory[p.category][key] += 1;
  }

  return NextResponse.json({
    total,
    mastered,
    learning,
    new: fresh,
    due,
    byCategory,
  });
}
