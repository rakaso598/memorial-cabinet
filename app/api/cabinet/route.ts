import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
// bcryptjs require 방식으로 import (Next.js API Route 호환)
const bcrypt = require("bcryptjs") as typeof import("bcryptjs");

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { name, password } = await req.json();
  if (!name || typeof name !== "string" || name.length > 6) {
    return NextResponse.json(
      { error: "잘못된 캐비넷 이름입니다. (최대 6자)" },
      { status: 400 }
    );
  }
  if (!/^[0-9]{4}$/.test(password)) {
    return NextResponse.json(
      { error: "비밀번호는 숫자 4자리여야 합니다." },
      { status: 400 }
    );
  }

  // 이미 존재하는지 확인
  let cabinet = await prisma.cabinet.findUnique({ where: { name } });

  if (!cabinet) {
    // 새로 생성
    let hash: string | null = null;
    if (password) {
      hash = await bcrypt.hash(password, 10);
    }
    cabinet = await prisma.cabinet.create({
      data: {
        name,
        password: hash,
      },
    });
    return NextResponse.json({
      created: true,
      id: cabinet.id,
      name: cabinet.name,
      hasPassword: !!hash,
    });
  } else {
    // 이미 존재: 비밀번호 확인 필요
    if (cabinet.password) {
      if (!password) {
        return NextResponse.json(
          { error: "비밀번호가 필요합니다." },
          { status: 401 }
        );
      }
      const match = await bcrypt.compare(password, cabinet.password);
      if (!match) {
        return NextResponse.json(
          { error: "비밀번호가 일치하지 않습니다." },
          { status: 401 }
        );
      }
    }
    return NextResponse.json({
      created: false,
      id: cabinet.id,
      name: cabinet.name,
      hasPassword: !!cabinet.password,
    });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "이름이 필요합니다." }, { status: 400 });
  }
  const cabinet = await prisma.cabinet.findUnique({ where: { name } });
  if (!cabinet) {
    return NextResponse.json(
      { error: "존재하지 않는 캐비넷입니다." },
      { status: 404 }
    );
  }
  return NextResponse.json({
    id: cabinet.id,
    name: cabinet.name,
    hasPassword: !!cabinet.password,
  });
}
