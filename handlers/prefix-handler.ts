import { Client } from "discord.js";
const prefixScheema = require('../mongoDB/schemas/prefix-scheema');

// All guild prefixes.
let guildPrefixes: any = {};

export default {
    async createGuildPrefixes(client: Client) {
        for (const guild of client.guilds.cache) {
            const guildId = guild[1].id;
            const result = await prefixScheema.findOne({ _id: guildId });
            if (!result) continue;
            guildPrefixes[guildId] = result.prefix;
        }
    },

    getGuildPrefixes() {
        return guildPrefixes;
    },

    updateGuildPrefix(guildId: string, prefix: string) {
        guildPrefixes[guildId] = prefix;
    }
}