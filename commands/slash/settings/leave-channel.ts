import { ChatInputCommandInteraction } from "discord.js";
import guildScheema from "../../../scheemas/guildSchema";

export default {
    subCommand: "settings.leave.channel",
    callback: async (interaction: ChatInputCommandInteraction) => {
        const selectedChannel = interaction.options.getChannel('channel');

        try {
            const guildSettigns = await guildScheema.findByIdAndUpdate(interaction.guildId, { $set: { 'goodbye.goodbye_channel': selectedChannel?.id } }, { upsert: true, new: true, setDefaultsOnInsert: true });

            if (!guildSettigns.goodbye?.goodbye_message) {
                await interaction.reply(`👋 Leave messages will now be sent to <#${selectedChannel?.id}>. Try </settings leave message:1130343177728053328> to change the leave message and image.`);
            } else {
                await interaction.reply(`👋 Leave messages will now be sent to <#${selectedChannel?.id}>. Try </leave test:1130343177728053329> to test leave messages.`);
            }
            
        } catch (err) {
            console.error(err);
        }
    }
}