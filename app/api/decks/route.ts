import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { DeckStatus } from "@/lib/generated/prisma/enums";
import { inngest } from "@/lib/inngest/client";

const createDeckSchema = z.object({
  idea: z
    .string()
    .trim()
    .min(20, "Project idea must be at least 20 characters."),
});

export async function GET() {
  const decks = await prisma.deck.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { Slides: true } },
    },
  });

  return NextResponse.json(
    decks.map((deck) => ({
      id: deck.id,
      idea: deck.idea,
      title: deck.title,
      status: deck.status,
      errorMessage: null,
      slideCount: deck._count.Slides,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    })),
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createDeckSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const deck = await prisma.deck.create({
    data: {
      idea: parsed.data.idea,
      status: DeckStatus.PENDING,
    },
  });

  try {
    await inngest.send({
      name: "deck/generate-deck",
      data: { deckId: deck.id },
    });
  } catch (error) {
    console.error("Failed to send Inngest event. Is `npm run inngest:dev` running?", error);
  }

  return NextResponse.json(
    { id: deck.id, status: deck.status },
    { status: 201 },
  );
}
