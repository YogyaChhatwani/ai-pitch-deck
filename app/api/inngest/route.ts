import { inngest } from "@/lib/inngest/client";
import { generateDeck } from "@/lib/inngest/functions/generate-deck";
import { serve } from "inngest/next";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateDeck],
});