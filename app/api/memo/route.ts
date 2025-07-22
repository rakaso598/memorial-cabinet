import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: ?cabinetId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cabinetId = searchParams.get("cabinetId");
  if (!cabinetId) {
    return NextResponse.json(
      { error: "cabinetId가 필요합니다." },
      { status: 400 }
    );
  }
  const memos = await prisma.memo.findMany({
    where: { cabinetId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(memos);
}

// POST: { cabinetId, title, content }
export async function POST(req: NextRequest) {
  const { cabinetId, title, content } = await req.json();
  if (!cabinetId || !title) {
    return NextResponse.json(
      { error: "cabinetId와 제목이 필요합니다." },
      { status: 400 }
    );
  }
  const memo = await prisma.memo.create({
    data: { cabinetId, title, content: content || "" },
  });
  return NextResponse.json(memo);
}

// PUT: { id, title, content }
export async function PUT(req: NextRequest) {
  const { id, title, content } = await req.json();
  if (!id || !title) {
    return NextResponse.json(
      { error: "id와 제목이 필요합니다." },
      { status: 400 }
    );
  }
  const memo = await prisma.memo.update({
    where: { id },
    data: { title, content, updatedAt: new Date() },
  });
  return NextResponse.json(memo);
}

// DELETE: { id }
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  }
  await prisma.memo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
