import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const due = searchParams.get("due");

  const where: Prisma.ProblemWhereInput = {};

  if (category) where.category = category;
  if (status) where.status = status;
  if (search) where.title = { contains: search, mode: "insensitive" };
  if (due === "true") {
    where.nextReviewAt = { lte: new Date() };
  }

  const problems = await prisma.problem.findMany({
    where,
    orderBy: { order: "asc" },
  });

  return NextResponse.json(problems);
}
