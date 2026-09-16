import ImageKit, { toFile } from "@imagekit/nodejs";
import "dotenv/config";

let imagekitClient: ImageKit | null = null;

function getImagekitClient(): ImageKit {
    let imagekitKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!imagekitKey) {
        throw new Error("IMAGEKIT_PRIVATE_KEY is not set");
    }
    imagekitClient ??= new ImageKit({privateKey: imagekitKey});

    return imagekitClient;
}

export async function uploadImage(image: Buffer, fileName: string): Promise<string> {
    const imagekitClient = getImagekitClient();
    const response = await imagekitClient.files.upload({
        file: await toFile(image, fileName),
        fileName: fileName,
        folder: "deck-images",
    });

   console.log(`Image uploaded to ImageKit: ${response?.url}`);
   return response?.url ?? "";
}