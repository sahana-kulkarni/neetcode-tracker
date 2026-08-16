import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
