import { client } from '../index';
import { Client, ActivityType } from 'discord.js';
import mongo from '../mongoDB/mongo';
import prefixHandler from '../handlers/prefix-handler';

// On bot ready.
client.on('ready', async (bot: Client) => {
    console.log('\n------------------------------------------------------\n');
    console.log(`Successfully logged in as ${bot.user!.tag}`);

    bot.user!.setActivity('ma!help', { type: ActivityType.Listening });
    // Connect to mongo.
    await mongo().then(async (mongoose) => {
        try {
            console.log('Successfully connected to mongo');
        } finally {
            mongoose.connection.close();
        }
    });
    prefixHandler.createGuildPrefixes(client);
    console.log('\n------------------------------------------------------');
});