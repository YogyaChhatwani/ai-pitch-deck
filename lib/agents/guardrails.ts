import { Agent, type InputGuardrail, type OutputGuardrail, run } from "@openai/agents";
import { z } from "zod";

const getInput = (input: string | unknown[]): string => {
    if (typeof input === "string") {
        return input;
    }
    return JSON.stringify(input);
};

export const validateInputGuardrails: InputGuardrail = {
    name: "input-length-guardrail",
    execute: async ({ input }) => {
        const text = getInput(input).trim();
        const tooShort = text.length < 20;
        return {
            tripwireTriggered: tooShort,
            outputInfo: tooShort
                ? { reason: "Project idea must be at least 20 characters." }
                : undefined,
        };
    }
};
const QualityCheckSchema = z.object({
    isValid: z.boolean(),
    reason: z.string().optional(),
});
const QUALITY_CHECK_INSTRUCTIONS = `
You are an expert quality check agent.
You are given a pitch deck JSON. you need to check if it is of good quality and is relevant to the project idea.
Output the result in the following schema - ${QualityCheckSchema}
{
    isValid: boolean,
    reason: string | undefined,
}
Return isValid: false if it has any -
- inappropriate words or phrases.
-phrases with placeholder text like TBD,{INSERT_HERE},etc.
- slides with no images .
- any other reason that is not relevant to the project idea.

Give a precise reason for the same in case of invalidity

In any other case, return isValid: true.

Example 1:
Project Idea : " A platform that allows users to create and share their own Food recipes and get paid for it."
Response : "{
    "title": "A platform that allows users to create and share their own Food recipes and get paid for it.",
    "slides": [
        {
            "title": "A platform that allows users to create and share their own Food recipes and get paid for it.",
            "content": "Create and share your own Food recipes and get paid for it.",
            imagePrompt:"Generate an image of a food recipe and the food items in the recipe",
        }
    ]
}"
Output : {
    isValid: true,
    reason: undefined,
}
Example 2:
Project Idea : " A platform that allows users to create and share their own Food recipes and get paid for it."
Response : "{
    "title": "A platform to create and add your images",
    "slides": [
        {
            "title": "A platform to create and add your images",
            "content": "Create and add your images",
            imagePrompt:"Generate an image of a person taking a selfie",
        }
    ]
}"
Output : {
    isValid: false,
    reason: "Response is not relevant to the project idea",
}

`;

const QualityCheckAgent = new Agent({
    name: "Quality Check Agent",
    instructions: QUALITY_CHECK_INSTRUCTIONS,
    model: "gpt-4o-mini",
})

export const qualityCheckResult = async (deckJSON: string) => {
    const result = await run(QualityCheckAgent, deckJSON)
    return result;
};
export const validateOutputGuardrails: OutputGuardrail = {
    name: "output-length-guardrail",
    execute: async ({ agentOutput }) => {
        const deckJSON = getInput(agentOutput).trim();
        const result = await qualityCheckResult(deckJSON);
        const isValid = QualityCheckSchema.parse(result.finalOutput as unknown).isValid;
        return {
           tripwireTriggered: result.finalOutput,
           outputInfo: isValid ? undefined : { reason: isValid?.reason ?? "Invalid pitch deck. Please check the pitch deck and try again." },
        };
    }
};
