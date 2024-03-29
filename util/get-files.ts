import fs from "fs";
import path from "path"

/**
 * Gets all files from a particular directory and extention.
 * @param dir 
 * @param ext 
 */
const getFiles = (dir: string, ext: string, handler: string) => {
    if (!(/\.([a|A-z|Z]|\d)+$/g).test(ext)) { // Test to check if the file extention is a valid one.
        throw new Error(`Invalid extention: ${ext}`);
    };

    const filesInDir = fs.readdirSync(dir); // Get all files in current directory.
    let files: string[] = [];

    filesInDir.forEach((file) => {
        const filePath = path.resolve(dir, file);

        try {
            const subFiles = getFiles(filePath, ext, handler);
            Array.prototype.push.apply(files, subFiles);
        } catch {
            if (path.extname(filePath) === ext) {
                files.push(path.resolve(filePath));
                console.log(`[GET-FILES][${handler}] - File ${path.basename(filePath)} was loaded successfully`.yellow);
            }
        }
    });

    return files;
}

export default getFiles;