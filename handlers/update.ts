import { Client } from 'discord.js';
import mongo from './mongo';
const prefixScheema = require('../schemas/prefix-scheema');

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
}