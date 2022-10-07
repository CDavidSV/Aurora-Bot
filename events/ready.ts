import { client } from '../index';
import { Client } from 'discord.js';
import dynamicStatus from '../handlers/dynamic-status';
import db from '../mongoDB/mongo';
import prefixHandler from '../handlers/prefix-handler';
import config from "../config.json";
import slashCommandHandler from '../handlers/slash-command-handler';

// On bot ready.
let startTime = new Date().getTime();

client.on('ready', async (bot: Client) => {
    console.log('\n----------------------------------------------------\n');
    console.log(`Successfully logged in as ${bot.user!.tag}`);
    db.connect();

    // Generates a random status.
    dynamicStatus.run();

    // Innitializes Slash Commands.
    await slashCommandHandler.getSlashCommands();

    prefixHandler.createGuildPrefixes(client);
    console.log('\n----------------------------------------------------');
});

export default startTime;