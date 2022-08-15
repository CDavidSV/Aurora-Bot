import { Client } from "discord.js";
import mongo from "../mongoDB/mongo";
const prefixScheema = require('../mongoDB/schemas/prefix-scheema');

// All guild prefixes.
let guildPrefixes: any = {};

export default {
    async createGuildPrefixes(client: Client) {
        await mongo().then(async (mongoose) => {
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
        });
    },

    getGuildPrefixes() {
        return guildPrefixes;
    },

    updateGuildPrefix(guildId: string, prefix: string) {
        guildPrefixes[guildId] = prefix;
    }
}