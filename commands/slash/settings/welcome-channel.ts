import { ChatInputCommandInteraction } from "discord.js";
import guildSchema from "../../../schemas/guildSchema";

export default {
    subCommand: "settings.welcome.channel",
    callback: async (interaction: ChatInputCommandInteraction) => {
        const selectedChannel = interaction.options.getChannel('channel');

        try {
            const guildSettigns = await guildSchema.findByIdAndUpdate(interaction.guildId, { $set: { 'welcome.welcome_channel': selectedChannel?.id } }, { upsert: true, new: true, setDefaultsOnInsert: true });

            if (!guildSettigns.welcome?.welcome_message) {
                await interaction.reply(`👋 Welcome messages will now be sent to <#${selectedChannel?.id}>. Try </settings welcome message:1130343177728053328> to change the welcome message and image.`);
            } else {
                await interaction.reply(`👋 Welcome messages will now be sent to <#${selectedChannel?.id}>. Try </welcome test:1130343177728053329> to test welcome messages.`);
            }
            
        } catch (err) {
            console.error(err);
        }
    }
}