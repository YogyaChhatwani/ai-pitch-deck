import { prisma } from "@/lib/db";
import { inngest } from "../client";
import { DeckStatus } from "@/lib/generated/prisma/enums";
import { generatePitchDeck } from "@/lib/agents/generate-pitch-deck";
import { generateImage } from "@/lib/openai";
import { uploadImage } from "@/lib/imagekit";

export const generateDeck = inngest.createFunction(
    {
        id: "generate-deck",
        triggers: [{event:"deck/generate-deck"}]
    },

    async ({ event, step }) => {
        const deckId = event.data.deckId;
        const deck = await step.run("get-deck", async () => {
            const record = await prisma.deck.findUnique({
                where: { id: deckId}
            });
            if (!record) {
                throw new Error("Deck not found");
            }
            return record;
        });
        const deckGeneratedResponse = await step.run("generate-deck", async () => {
            //change status to generating
            await step.run("mark-deck-generating", async () => {
                await prisma.deck.update({
                    where: { id: deck.id },
                    data: { status: DeckStatus.GENERATING }
                });
            });

            //call agent to generate deck(with input and output rails)
            const pitchDeck = await step.run("run-agent", async () => {
                const agentResult = await generatePitchDeck(deck.idea);
                return agentResult;
            });
            //save the image title to the db 
         
            // Step 5 — for each slide: generate image → upload to ImageKit → save to DB
            await step.run("generate-images", async () => {
                for (let index = 0; index < pitchDeck.slides.length; index++) {
                    const slide = pitchDeck.slides[index];
                    const order = index + 1;
                    const fileName = `${deck.id}-${order}`;
                    const imageUrl = await step.run("generate-image", async () => {
                        const image = await generateImage(slide.imagePrompt);
                        const imageUrl = await uploadImage(image, fileName);
                        return imageUrl;
                    });
                    await step.run(`save-slide-${order}`, async () => {
                        await prisma.slide.create({
                            data: {
                                deckId: deck.id,
                                order,
                                title: slide.title,
                                content: slide.content,
                                imagePrompt: slide.imagePrompt,
                                imageUrl,
                            },
                        });
                    });
                }
            });
        });

        return deckGeneratedResponse;
    }
);