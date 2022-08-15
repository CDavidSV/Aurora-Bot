import fs, { Dirent } from 'fs';

// Recursive function that gets all directories and command script files.
const getFiles = (dir: string, suffix: string, handler: string): string[] => {
    const files: Dirent[] = fs.readdirSync(dir, {
        withFileTypes: true,
    })

    let Files: string[] = [];

    // Loop through all directories and add them to an array.
    for (const file of files) {
        // In case the current path is not a file but a folder.
        if (file.isDirectory()) {
            Files = [
                ...Files,
                ...getFiles(`${dir}/${file.name}`, suffix, handler),
            ]

        } else if (file.name.endsWith(suffix)) { // path is a script file.
            Files.push(`${dir}/${file.name}`);
            console.log(`[GET-FILES][${handler.toUpperCase()} HANDLER] - File ${file.name} was loaded sucessfully.`);
        }
    }

    return Files; // Returns array with directories.
}

export default getFiles