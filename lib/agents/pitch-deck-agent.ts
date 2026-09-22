// create a new openai agent with the following name: "Pitch Deck Agent"
import { Agent } from "@openai/agents";
import { validateInputGuardrails, validateOutputGuardrails } from "./guardrails";
import { PitchDeckSchema } from "../schemas/pitch-deck-schema";
const PITCH_DECK_INSTRUCTIONS = `
You are an expert pitch deck agent. You are given a business idea and you need to create a pitch deck for the same .

 Given a project idea, create 6–7 slides in this order:
 - Title : A catchy and relevant title for the business idea.
 - Problem: A Clear and concise description of the problem that the business idea solves.
 - Market: The target market for the business idea.
 - Funding Requirements: The funding requirements for the business idea.

Rules:
- The pitch deck should have a bullet point format for each slide.
- Return a JSON object with the following format:
{
   imagePrompt: string; An accurate prompt to generate a relevant image for the slide based on the title and content of the slide.
   title:string,
   content:string,
   deckId: number
}
- Content shopuld be relevant to the idea and in no way use inappropriate words or phrases.
`;
const pitchDeckAgent = new Agent({
    name: "Pitch Deck Agent",
    instructions: PITCH_DECK_INSTRUCTIONS,
    model: "gpt-4o-mini",
    inputGuardrails: [validateInputGuardrails],
    outputType: PitchDeckSchema as any,
    outputGuardrails: [validateOutputGuardrails],

});
export { pitchDeckAgent };

// expected output:
// {
//     "deckTitle": "RecipePay",
//     "slides": [
//       {
//         "title": "The Problem",
//         "content": "Home cooks struggle to monetize recipes...",
//         "imagePrompt": "A home cook photographing a plated dish"
//       }
//     ]
//   }