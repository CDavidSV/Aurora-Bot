import { client } from '../index';
import getFiles from '../handlers/get-files';
import config from '../config.json';
import mongo from '../mongoDB/mongo';
import { Message, EmbedBuilder, ColorResolvable, ChannelType } from 'discord.js';

export default {
    getCommands() {
        // Create command object (all executable commands).
        const commands: { aliases: string[], execute: any }[] = []

        // Ending suffix for file type.
        const suffix = '.ts';

        // Get all directories for each command.
        const commandFiles = getFiles('./commands', suffix, 'COMMAND');

        // Loop through all commmands in the commandsFile array and add them to the commands object. 
        for (const command of commandFiles) {
            let commandFile = require(`.${command}`);
            if (commandFile.default) commandFile = commandFile.default;

            commands[commandFiles.indexOf(command)] = commandFile;
        }

        return commands;
    }
}