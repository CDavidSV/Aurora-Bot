import { Events, Guild } from "discord.js";
import guildSchema from "../schemas/guildSchema";

export default {
    name: Events.GuildCreate,
    once: false,
    async execute(guild: Guild) {
        const id = guild.id;

        guildSchema.findByIdAndUpdate(id, { id }, { upsert: true, setDefaultsOnInsert: true }).catch(console.error);
    }
}