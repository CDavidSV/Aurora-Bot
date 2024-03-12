import { ChatInputCommandInteraction } from "discord.js";
import guildScheema from "../../../schemas/guildSchema";

export default {
    subCommand: "settings.leave.disable",
    callback: async (interaction: ChatInputCommandInteraction) => {

        try {
            const guild = await guildScheema.findOneAndUpdate({ _id: interaction.guildId }, { $set: { 'goodbye.goodbye_channel': null } }, { upsert: true, new: true, setDefaultsOnInsert: true });

            if (!guild.goodbye?.goodbye_channel) {
                return await interaction.reply(`Leave messages disabled. Use </settings leave channel:1129638877569765376> to enable them again`);
            }
        } catch (err) {
            console.error(err);
        }
    }
}