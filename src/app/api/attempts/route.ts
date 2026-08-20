import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { schedule, type Quality } from "@/lib/scheduler";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { problemId, quality, timeSeconds, notes } = body;

  if (!problemId || ![1, 2, 3, 4].includes(quality)) {
    return NextResponse.json(
      { error: "problemId and a quality rating (1-4) are required" },
      { status: 400 },
    );
  }

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const result = schedule(
    { easeFactor: problem.easeFactor, intervalDays: problem.intervalDays },
    quality as Quality,
  );

  const [, updated] = await prisma.$transaction([
    prisma.attempt.create({
      data: {
        problemId,
        quality,
        timeSeconds: timeSeconds ?? null,
        notes: notes || null,
      },
    }),
    prisma.problem.update({
      where: { id: problemId },
      data: {
        easeFactor: result.easeFactor,
        intervalDays: result.intervalDays,
        status: result.status,
        nextReviewAt: result.nextReviewAt,
        lastReviewedAt: new Date(),
        reviewCount: { increment: 1 },
      },
    }),
  ]);

  return NextResponse.json(updated);
}
