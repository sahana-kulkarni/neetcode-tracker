import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const problems = await prisma.problem.findMany();
  const now = new Date();

  const total = problems.length;
  const mastered = problems.filter((p) => p.status === "mastered").length;
  const learning = problems.filter((p) => p.status === "learning").length;
  const fresh = problems.filter((p) => p.status === "new").length;
  const due = problems.filter(
    (p) => p.status === "new" || (p.nextReviewAt && p.nextReviewAt <= now)
  ).length;

  const byCategory: Record
    string,
    { total: number; mastered: number; learning: number; new: number }
  > = {};

  for (const p of problems) {
    byCategory[p.category] ??= { total: 0, mastered: 0, learning: 0, new: 0 };
    byCategory[p.category].total += 1;
    byCategory[p.category][p.status as "mastered" | "learning" | "new"] += 1;
  }

  return NextResponse.json({ total, mastered, learning, new: fresh, due, byCategory });
}