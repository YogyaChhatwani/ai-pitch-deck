import ImageKit from "@imagekit/nodejs";
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