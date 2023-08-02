import { ModalSubmitInteraction, TextChannel } from "discord.js";

export default {
    name: 'sayMessageModal',
    callback: async (interaction: ModalSubmitInteraction) => {
        const channelId = interaction.customId.split('.')[1];
        if (!channelId) return await interaction.reply({ content: 'Unable to send Message' });

        const channel = interaction.guild?.channels.cache.get(channelId) as TextChannel | undefined;
        if (!channel) return await interaction.reply({ content: "An Unexpected Error occurred while sending the message to the specified channel. Please try again.", ephemeral: true });

        const message = interaction.fields.getTextInputValue('messageInput');

        channel?.send(`${message} \n\n*By:* **${interaction.member?.user.username}**`).then(async () => {
            interaction.reply({ content: "*Message sent successfully*", ephemeral: true });
        }).catch(() => {
            interaction.reply({ content: "An Unexpected Error occurred while sending the message to the specified channel. Please try again.", ephemeral: true})
        });
    }
}