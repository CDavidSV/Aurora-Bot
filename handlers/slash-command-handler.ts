import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import MCommand from '../Classes/MCommand';
import { clientId, testGuildId } from '../config.json';
import getFiles from './get-files';
dotenv.config();

export default {
    async getSlashCommands() {
        // Create command object (all executable commands).
        const slashCommands: MCommand[] = [];

        // Ending suffix for file type.
        const suffix = '.ts';

        // Get all directories for each command.
        const commandFiles = getFiles('./commands', suffix, 'SLASH COMMAND', false);

        // Loop through all commmands in the commandsFile array and add them to the commands object. 
        for (const command of commandFiles) {
            let commandFile = require(`.${command}`);
            if (commandFile.default) commandFile = commandFile.default;

            slashCommands.push(commandFile.data.toJSON());
        }

        for (const command of slashCommands) {
            if (command.commandType === 'Prefix') {
                slashCommands.splice(slashCommands.indexOf(command, 1));
            }
        }

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string);
        
        await rest.put(Routes.applicationGuildCommands(clientId, testGuildId), { body: slashCommands })
            .then((data: any) => console.log(`Successfully registered ${data.length} application commands`))
            .catch(console.error);
    }
}