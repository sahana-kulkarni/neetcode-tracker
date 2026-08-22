import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectAttemptsToMastery } from "@/lib/scheduler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const problem = await prisma.problem.findUnique({
    where: { id: Number(id) },
    include: { attempts: { orderBy: { attemptedAt: "desc" } } },
  });

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const attemptsToMastery =
    problem.status === "mastered"
      ? 0
      : projectAttemptsToMastery({
          easeFactor: problem.easeFactor,
          intervalDays: problem.intervalDays,
        });

  return NextResponse.json({ ...problem, attemptsToMastery });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { starred, notes } = body;

  const data: { starred?: boolean; notes?: string } = {};
  if (typeof starred === "boolean") data.starred = starred;
  if (typeof notes === "string") data.notes = notes;

  const updated = await prisma.problem.update({
    where: { id: Number(id) },
    data,
  });

  return NextResponse.json(updated);
}
