import { ChatInputCommandInteraction } from "discord.js";
import guildScheema from "../../../schemas/guildSchema";

export default {
    subCommand: "settings.leave.embed",
    callback: async (interaction: ChatInputCommandInteraction) => {
        const option = interaction.options.getBoolean('enable');

        try {
            const guild = await guildScheema.findOneAndUpdate({ _id: interaction.guildId }, { $set: { 'goodbye.embed': option } }, { upsert: true, new: true, setDefaultsOnInsert: true });

            const message = guild.goodbye?.embed ? '👋 Leave messages will now be sent as embeds' : '👋 Leave messages will no longer be sent as embeds';

            if (!guild.goodbye?.goodbye_channel) {
                return await interaction.reply(`${message}. Try </settings leave channel:1129638877569765376> to enable leave messages`);
            }

            await interaction.reply(`${message}. Try </settings leave message:1129638877569765376> to change the leave message and image.`);
        } catch (err) {
            console.error(err);
        }
    }
}