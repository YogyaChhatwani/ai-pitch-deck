import Link from "next/link";

import { DeckViewer } from "@/components/deck-viewer";
import { Button } from "@/components/ui/button";

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-12">
      <Button variant="ghost" size="sm" className="self-start" render={<Link href="/decks" />}>
        ← Back to decks
      </Button>
      <DeckViewer deckId={id} />
    </main>
  );
}
