import vision from "@google-cloud/vision";
import { Attachment } from "discord.js";
import dotenv from "dotenv";

dotenv.config();
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS!);
const client = new vision.ImageAnnotatorClient({
    credentials: CREDENTIALS,
    projectId: CREDENTIALS.project_id
});

/**
 * 
 * @param attatchment 
 */
const isImage = (attatchment: Attachment) => {
    try { 
        const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/tiff", "image/webp"];
    
        if (imageTypes.includes(attatchment.contentType || "")) {
          return true; // The file is an image
        } else {
          return false; // The file is not an image
        }
      } catch (err) {
        console.log("Error: ", err);
        return false;
      }
}

/**
 * 
 * @param imageUrl 
 */
const getImageText = async (imageUrl: string) => {
    try {
        const [result] = await client.textDetection(imageUrl);
        
        if (result.textAnnotations && result.textAnnotations[0]) {
            return result.textAnnotations[0].description;
        } else {
            return undefined
        }
    } catch {
        return null;
    }
}

export {
    isImage,
    getImageText
}