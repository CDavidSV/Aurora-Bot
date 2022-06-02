import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable, TextChannel } from 'discord.js';
import config from './config.json';
import mongo from './mongo';
import fs from 'fs';
const autoclearScheema = require('./schemas/autoclear-scheema');
const prefixScheema = require('./schemas/prefix-scheema');

export default {
    async updateGuildPrefixes(client: Client) {
        // Load al server prefixes.
        const guildPrefixes: any = {};

        await mongo().then(async mongoose => {
            try {
                for (const guild of client.guilds.cache) {
                    const guildId = guild[1].id;
                    const result = await prefixScheema.findOne({ _id: guildId });
                    if (!result) continue;
                    guildPrefixes[guildId] = result.prefix;
                }
            } finally {
                mongoose.connection.close();
            }
        })
        return guildPrefixes;
    },

    updateAutoClear(client: Client) {
        // Channels array.
        let channels: any[] = [];
        // Get channels document from database.
        mongo().then(async (mongoose) => {
            try {
                const guildIds = client.guilds.cache.map(guild => guild.id)
                for (let guildId of guildIds) {
                    const results = await autoclearScheema.findOne({ "_id": guildId });
                    if (!(results === null)) {
                        channels.push(results);
                    }
                }
            } finally {
                mongoose.connection.close();
            }
            const jsonObj = JSON.stringify(channels);
            fs.writeFile('./guild-clear-channels.json', jsonObj, function (error) {
                if (error) {
                    return;
                }
            });
        });
    }
}