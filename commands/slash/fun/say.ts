import { ActionRowBuilder, CacheType, ChatInputCommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, PermissionsBitField, SlashCommandBuilder, TextBasedChannel, TextInputBuilder, TextInputStyle } from "discord.js";

const modal = new ModalBuilder()
    .setCustomId('sayMessageModal')
    .setTitle('Your Message');

export default {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('📢 Send a message through me.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Whatever you want to say.')
                .setRequired(false)),
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        let message: string = interaction.options.getString("message")!;
        if (!message) {
            const messageInput = new TextInputBuilder()
                .setCustomId('messageInput')
                .setLabel('message')
                .setStyle(TextInputStyle.Paragraph)

            const firstRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(messageInput);
            modal.addComponents(firstRow);

            await interaction.showModal(modal);

            return;
        }

        const channel = interaction.channel as TextBasedChannel;

        channel?.send(`${message} \n\n*By:* **${interaction.member?.user.username}**`);
        interaction.reply({ content: "*Message successfully sent*", ephemeral: true});
    },
};