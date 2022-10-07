import { client } from '../index';
import getFiles from '../handlers/get-files';

export default {
    getCommands() {
        // Ending suffix for file type.
        const suffix = '.ts';

        // Get all directories for each command.
        const commandFiles = getFiles('./commands', suffix, 'COMMAND', true);

        // Loop through all commmands in the commandsFile array and add them to the commands object. 
        for (const command of commandFiles) {
            let commandFile = require(`.${command}`);
            if (commandFile.default) commandFile = commandFile.default;

            client.commands.set(commandFile.data.name, commandFile);
        }
    }
}