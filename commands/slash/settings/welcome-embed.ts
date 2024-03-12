import { ChatInputCommandInteraction } from "discord.js";
import guildScheema from "../../../schemas/guildSchema";

export default {
    subCommand: "settings.welcome.embed",
    callback: async (interaction: ChatInputCommandInteraction) => {
        const option = interaction.options.getBoolean('enable');

        try {
            const guild = await guildScheema.findOneAndUpdate({ _id: interaction.guildId }, { $set: { 'welcome.embed': option } }, { upsert: true, new: true, setDefaultsOnInsert: true });

            const message = guild.welcome?.embed ? '👋 Welcome messages will now be sent as embeds' : '👋 Welcome messages will no longer be sent as embeds';

            if (!guild.welcome?.welcome_channel) {
                return await interaction.reply(`${message}. Try </settings welcome channel:1129638877569765376> to enable welcome messages`);
            }

            await interaction.reply(`${message}. Try </settings welcome message:1129638877569765376> to change the welcome message and image.`);
        } catch (err) {
            console.error(err);
        }
    }
}