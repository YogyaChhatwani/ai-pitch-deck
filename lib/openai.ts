// file to initialize openai client
import { OpenAI } from "openai";
import "dotenv/config";

let openaiClient: OpenAI | null = null;
const IMAGE_MODEL = "gpt-image-1-mini";
const IMAGE_SIZE = "1024x1024";


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

/**
 * Dev shortcut: use a free stock photo instead of calling OpenAI.
 * Enable with USE_PLACEHOLDER_IMAGES=true in .env
 */
export async function usePlaceholderImages(): Promise<Buffer> {
    //api call to get the placeholder images
    const response = await fetch("https://picsum.photos/200/300");
    const imageBuffer: ArrayBuffer = await response.arrayBuffer();
    return Buffer.from(imageBuffer);
}

export async function generateImageFromOpenAI(prompt: string): Promise<Buffer> {
    const openai = getOpenaiClient();
    const response = await openai.images.generate({
        prompt: prompt,
        n: 1,
        size: IMAGE_SIZE,
        model: IMAGE_MODEL,
    });
    const imageGeneratedResponse = response.data?.[0]?.b64_json;
    if (!imageGeneratedResponse) {
        throw new Error("Failed to generate image");
    }
    return Buffer.from(imageGeneratedResponse, "base64");
}

export async function generateImage(prompt: string): Promise<Buffer> {
    if(process.env.USE_PLACEHOLDER_IMAGES === "true") {
        return await usePlaceholderImages();
    }
    return await generateImageFromOpenAI(prompt);
}