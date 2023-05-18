import vision from "@google-cloud/vision";
import dotenv from "dotenv";

dotenv.config();
const CREDENTIALS = JSON.parse(process.env.GOOGLE_CREDENTIALS!);
const client = new vision.ImageAnnotatorClient({
    credentials: CREDENTIALS,
    projectId: CREDENTIALS.project_id
});

/**
 * 
 * @param url 
 */
const validateImageFormat = (url: string) => {
    try {
        const extension = url.split(".").pop();
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "tiff", "webp"]; // Add more extensions if needed
    
        if (extension && imageExtensions.includes(extension.toLowerCase())) {
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
const getImageText =  async (imageUrl: string) => {
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
    validateImageFormat,
    getImageText
}