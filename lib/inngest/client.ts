// src/inngest/client.ts
import { Inngest } from "inngest";
export type InngestEvents = {
    "deck/generate-deck": {
      data: {
        deckId: string;
      };
    };
  };
export const inngest = new Inngest({
    id: "ai-pitch-deck"
});