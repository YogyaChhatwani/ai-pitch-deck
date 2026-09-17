"use client";

import { useCallback, useEffect, useState } from "react";

import { DeckStatusBadge } from "@/components/deck-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import type { DeckDetail } from "@/lib/types/deckType";

const POLL_INTERVAL_MS = 3000;

function isGenerating(status: DeckDetail["status"]) {
  return status === "PENDING" || status === "GENERATING";
}

export function DeckViewer({ deckId }: { deckId: string }) {
  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchDeck = useCallback(async () => {
    const response = await fetch(`/api/decks/${deckId}`);

    if (!response.ok) {
      throw new Error("Deck not found");
    }

    return response.json() as Promise<DeckDetail>;
  }, [deckId]);

  // Initial load
  useEffect(() => {
    fetchDeck()
      .then(setDeck)
      .catch(() => setLoadError("Could not load this deck."));
  }, [fetchDeck]);

  // Poll while generating
  useEffect(() => {
    if (!deck || !isGenerating(deck.status)) {
      return;
    }

    const interval = setInterval(() => {
      fetchDeck()
        .then(setDeck)
        .catch(() => setLoadError("Could not refresh deck status."));
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [deck, fetchDeck]);

  // Track carousel slide number
  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    );
  }

  if (!deck) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Spinner className="size-5" />
        <span>Loading deck…</span>
      </div>
    );
  }

  const displayTitle = deck.title ?? "Untitled Pitch Deck";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {displayTitle}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{deck.idea}</p>
        </div>
        <DeckStatusBadge status={deck.status} />
      </div>

      {isGenerating(deck.status) ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-12 text-center">
          <Spinner className="size-8" />
          <div className="space-y-1">
            <p className="font-medium">Generating your pitch deck…</p>
            <p className="text-sm text-muted-foreground">
              This runs in the background via Inngest. The page refreshes every few
              seconds.
            </p>
            {deck.slides.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {deck.slides.length} slide{deck.slides.length === 1 ? "" : "s"} ready
                so far
              </p>
            ) : null}
          </div>
          <Progress value={null} className="w-full max-w-md">
            <ProgressLabel className="sr-only">Generating</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
      ) : null}

      {deck.status === "FAILED" ? (
        <Alert variant="destructive">
          <AlertTitle>Generation failed</AlertTitle>
          <AlertDescription>
            {deck.errorMessage ?? "Something went wrong while generating this deck."}
          </AlertDescription>
        </Alert>
      ) : null}

      {deck.status === "COMPLETED" && deck.slides.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Slide {currentSlide + 1} of {deck.slides.length}
          </p>
          <Carousel setApi={setCarouselApi} className="mx-auto w-full max-w-3xl px-12">
            <CarouselContent>
              {deck.slides.map((slide) => (
                <CarouselItem key={slide.id}>
                  <article className="overflow-hidden rounded-2xl border bg-card ring-1 ring-foreground/10">
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="aspect-video w-full object-cover"
                      />
                    ) : null}
                    <div className="space-y-3 p-6">
                      <h2 className="font-heading text-xl font-semibold">
                        {slide.title}
                      </h2>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {slide.content}
                      </p>
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      ) : null}
    </div>
  );
}