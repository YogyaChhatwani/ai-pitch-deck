// file to initialize openai client
import { OpenAI } from "openai";
import "dotenv/config";

let openaiClient: OpenAI | null = null;


function getOpenaiClient(): OpenAI {
    let openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
        throw new Error("OPENAI_API_KEY is not set");
    }
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: openaiKey,
        });
    }
    return openaiClient;
}