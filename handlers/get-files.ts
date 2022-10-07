import fs, { Dirent } from 'fs';

// Recursive function that gets all directories and command script files.
const getFiles = (dir: string, suffix: string, handler: string, log: boolean): string[] => {
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
                ...getFiles(`${dir}/${file.name}`, suffix, handler, log),
            ]

        } else if (file.name.endsWith(suffix)) { // path is a script file.
            Files.push(`${dir}/${file.name}`);
            if (log) console.log(`[GET-FILES][${handler.toUpperCase()} HANDLER] - File ${file.name} was loaded successfully.`);
        }
    }

    return Files; // Returns array with directories.
}

export default getFiles