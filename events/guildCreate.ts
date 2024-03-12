import { Events, Guild } from "discord.js";
import guildScheema from "../schemas/guildSchema";

export default {
    name: Events.GuildCreate,
    once: false,
    async execute(guild: Guild) {
        const id = guild.id;

        guildScheema.findByIdAndUpdate(id, { id }, { upsert: true, setDefaultsOnInsert: true }).catch(console.error);
    }
}