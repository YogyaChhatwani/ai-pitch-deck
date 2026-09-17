import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      Slides: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const { Slides, ...rest } = deck;

  return NextResponse.json({
    ...rest,
    errorMessage: null,
    slides: Slides.map((slide) => ({
      ...slide,
      imagePrompt: "",
    })),
  });
}
