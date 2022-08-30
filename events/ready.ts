import { client } from '../index';
import { Client, ActivityType } from 'discord.js';
import db from '../mongoDB/mongo';
import prefixHandler from '../handlers/prefix-handler';

// On bot ready.
client.on('ready', async (bot: Client) => {
    console.log('\n----------------------------------------------------\n');
    console.log(`Successfully logged in as ${bot.user!.tag}`);
    db.connect();

    bot.user!.setActivity('ma!help', { type: ActivityType.Listening });

    prefixHandler.createGuildPrefixes(client);
    console.log('\n----------------------------------------------------');
});