"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PLACEHOLDER ="Enter your idea here";

export function CreateDeckForm() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push(`/decks/${data.id}`);
    } catch {
      setError("Could not reach the server.Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <Textarea
        value={idea}
        onChange={(event) => setIdea(event.target.value)}
        placeholder={PLACEHOLDER}
        rows={5}
        required
        minLength={20}
        disabled={isSubmitting}
        aria-invalid={error ? true : undefined}
      />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting || idea.trim().length < 20}>
        {isSubmitting ? "Starting generation…" : "Generate Pitch Deck"}
      </Button>
    </form>
  );
}