import { ChatInputCommandInteraction } from "discord.js";
import guildScheema from "../../../scheemas/guildSchema";

export default {
    subCommand: "settings.welcome.disable",
    callback: async (interaction: ChatInputCommandInteraction) => {

        try {
            const guild = await guildScheema.findOneAndUpdate({ _id: interaction.guildId }, { $set: { 'welcome.welcome_channel': null } }, { upsert: true, new: true, setDefaultsOnInsert: true });

            if (!guild.welcome?.welcome_channel) {
                return await interaction.reply(`Welcome messages disabled. Use </settings welcome channel:1129638877569765376> to enable them again`);
            }
        } catch (err) {
            console.error(err);
        }
    }
}