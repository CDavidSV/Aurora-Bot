import { ModalSubmitInteraction } from "discord.js";
import guildSchema from "../schemas/guildSchema";

export default {
    name: 'welcomeMessageModal',
    callback: async (interaction: ModalSubmitInteraction) => {
        let welcomeText: string | null =  interaction.fields.getTextInputValue('messageInput');
        let imageUrl: string | null = interaction.fields.getTextInputValue('imageInput');

        welcomeText = welcomeText.length >= 1 ? welcomeText : null;
        imageUrl = imageUrl.length >= 1 ? imageUrl : null;

        await guildSchema.findByIdAndUpdate(
            interaction.guildId,
            {
                $set: {
                    'welcome.welcome_message': welcomeText,
                    'welcome.welcome_image': imageUrl
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true });

        await interaction.reply({ content: "Welcome message configuration changed successfully", ephemeral: true });
    }
}