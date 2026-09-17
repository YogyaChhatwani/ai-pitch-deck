import { DeckStatusBadge } from "@/components/deck-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function DecksPage() {
    const decks = await prisma.deck.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { Slides: true } },
        },
      });
    return (
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              My Decks
            </h1>
            <p className="text-sm text-muted-foreground">
              All pitch decks you have generated
            </p>
          </div>
          <Button render={<Link href="/" />}>New Deck</Button>
        </div>

        {decks.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No decks yet</EmptyTitle>
              <EmptyDescription>
                Create your first pitch deck from a project idea.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button render={<Link href="/" />}>Create a deck</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {decks.map((deck) => (
              <li key={deck.id}>
                <Link href={`/decks/${deck.id}`} className="block">
                  <Card className="transition-colors hover:bg-muted/30">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="line-clamp-1">
                          {deck.title ?? "Untitled Pitch Deck"}
                        </CardTitle>
                        <DeckStatusBadge status={deck.status} />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {deck.idea}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground">
                        {deck._count.Slides} slide
                        {deck._count.Slides === 1 ? "" : "s"} ·{" "}
                        {deck.createdAt.toLocaleDateString()}
                      </p>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    )
}