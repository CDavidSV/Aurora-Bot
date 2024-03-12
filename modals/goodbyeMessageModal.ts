import { ModalSubmitInteraction } from "discord.js";
import guildScheema from "../schemas/guildSchema";

export default {
    name: 'goodbyeMessageModal',
    callback: async (interaction: ModalSubmitInteraction) => {
        let goodbyeText: string | null =  interaction.fields.getTextInputValue('messageInput');
        let imageUrl: string | null = interaction.fields.getTextInputValue('imageInput');

        goodbyeText = goodbyeText.length > 1 ? goodbyeText : null;
        imageUrl = imageUrl.length > 1 ? imageUrl : null;

        await guildScheema.findByIdAndUpdate(
            interaction.guildId,
            {
                $set: {
                    'goodbye.goodbye_message': goodbyeText,
                    'goodbye.goodbye_image': imageUrl
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true });

        await interaction.reply({ content: "Leave message configuration changed successfully", ephemeral: true });
    }
}