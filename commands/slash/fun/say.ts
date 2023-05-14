import { ActionRowBuilder, CacheType, ChannelType, ChatInputCommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, ModalSubmitInteraction, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder, TextBasedChannel, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('📢 Send a message through me.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Whatever you want to say.')
                .setMinLength(1)
                .setMaxLength(2000)
                .setRequired(false))
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel you want the message to be sent to.')
                .setRequired(false))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages | PermissionFlagsBits.ManageChannels | PermissionFlagsBits.ManageMessages),
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        let channel: TextBasedChannel = interaction.options.getChannel("channel") as TextBasedChannel;
        if (!channel) {
            channel = interaction.channel as TextBasedChannel;
        }

        // Check if the bot has permissions to send messages in the channel
        if (channel.type !== ChannelType.DM && !channel.permissionsFor(interaction.client.user!)?.has(PermissionsBitField.Flags.SendMessages)) {
            return interaction.reply({ content: "*I don't have permission to send messages in this channel.*", ephemeral: true});
        }
        
        let message: string = interaction.options.getString("message")!;

        if (!message) {
            const modalId = `sayMessageModal${interaction.id}`;

            const modal = new ModalBuilder()
                .setCustomId(modalId)
                .setTitle('Your Message');

            const messageInput = new TextInputBuilder()
                .setCustomId('messageInput')
                .setLabel('message')
                .setMinLength(1)
                .setMaxLength(2000)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)

            const firstRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(messageInput);
            modal.addComponents(firstRow)

            await interaction.showModal(modal);
            await interaction.awaitModalSubmit({
                filter: (modalInteraction) => modalInteraction.customId === modalId && modalInteraction.user.id === interaction.user.id,
                time: 12_00_000,
            })
            .then(async (modalInteraction: ModalSubmitInteraction<CacheType>) => {
                message = modalInteraction.fields.getTextInputValue('messageInput');
           
                await modalInteraction.reply({ content: "*Message sent successfully*", ephemeral: true }).then(() => {
                    channel?.send(`${message} \n\n*By:* **${interaction.member?.user.username}**`);
                }).catch(() => {});
            })
            .catch(() => {
                return null;
            });
        } else {
            interaction.reply({ content: "*Message sent successfully*", ephemeral: true});
            channel?.send(`${message} \n\n*By:* **${interaction.member?.user.username}**`);       
        }
    },
};