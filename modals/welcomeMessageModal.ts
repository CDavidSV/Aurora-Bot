import { ModalSubmitInteraction } from "discord.js";
import guildScheema from "../scheemas/guildScheema";

export default {
    name: 'welcomeMessageModal',
    callback: async (interaction: ModalSubmitInteraction) => {
        let welcomeText: string | null =  interaction.fields.getTextInputValue('messageInput');
        let imageUrl: string | null = interaction.fields.getTextInputValue('imageInput');

        welcomeText = welcomeText.length > 1 ? welcomeText : null;
        imageUrl = imageUrl.length > 1 ? imageUrl : null;

        await guildScheema.findByIdAndUpdate(
            { _id: interaction.guildId },
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