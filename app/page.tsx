import { CreateDeckForm } from "@/components/create-deck-form";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-4 py-16">
      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Turn your idea into a pitch deck
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Describe your startup or project idea. AI will generate slides with
          images in the background.
        </p>
      </div>
      <CreateDeckForm />
      <p className="text-sm text-muted-foreground">
        Tip: include enough detail (at least 20 characters) so the AI guardrails
        accept your idea.
      </p>
    </main>
  );
}
