import fs, { Dirent } from 'fs';

// Recursive function that gets all directories and command script files.
const getFiles = (dir: string, suffix: string): string[] => {
    const files: Dirent[] = fs.readdirSync(dir, {
        withFileTypes: true,
    })

    let commandFiles: string[] = [];

    // Loop through all directories and add them to an array.
    for (const file of files) {
        // In case the current path is not a file but a folder.
        if (file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                ...getFiles(`${dir}/${file.name}`, suffix),
            ]

        } else if (file.name.endsWith(suffix)) { // path is a script file.
            commandFiles.push(`${dir}/${file.name}`);
        }
    }

    return commandFiles; // Returns array with directories.
}

export default getFiles