import { Attachment, ChatInputCommandInteraction, Embed, EmbedBuilder, Message, PartialMessage, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from "discord.js";
import clearMessages from "../../../util/clear-messages";

export default {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('🗑️ Delete messages in bulk')
        .addSubcommand(subcommand =>
            subcommand
                .setName('any')
                .setDescription('🗑️ Delete any messages')
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('How many messages to delete')
                        .setMinValue(1)
                        .setMaxValue(1000)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('bots')
                .setDescription('🗑️ Deletes messages sent by bots')
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('How many messages to delete')
                        .setMinValue(1)
                        .setMaxValue(1000)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('embeds')
                .setDescription('🗑️ Deletes all messages that contain embeds')
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('How many messages to delete')
                        .setMinValue(1)
                        .setMaxValue(1000)
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('contains')
                .setDescription('🗑️ Deletes all messages containing a substring')
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('How many messages to delete')
                        .setMinValue(1)
                        .setMaxValue(1000)
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('text')
                        .setDescription('substring contained within a message')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('images')
                .setDescription('🗑️ Deletes all messages containing an image')
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('How many messages to delete')
                        .setMinValue(1)
                        .setMaxValue(1000)
                        .setRequired(true)))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    borPerms: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
    callback: async (interaction: ChatInputCommandInteraction) => {
        const messageReply = await interaction.deferReply({ fetchReply: true });
        const command = interaction.options.getSubcommand();
        const channel = interaction.channel as TextChannel;

        // Switch through the different subcommands
        let embed: EmbedBuilder = new EmbedBuilder();
        switch (command) {
            case 'any':
                embed = await clearMessages(channel, interaction.options.getInteger('amount', true), interaction.user, messageReply as Message);
                break;
            case 'bots':
                embed = await clearMessages(channel, interaction.options.getInteger('amount', true), interaction.user, messageReply as Message, (message: Message | PartialMessage) => message.author!.bot);
                break;
            case 'embeds':
                embed = await clearMessages(channel, interaction.options.getInteger('amount', true), interaction.user, messageReply as Message, (message: Message | PartialMessage) => message.embeds.length !== 0);
                break;
            case 'contains':
                const includesText = interaction.options.getString('text', true);
                embed = await clearMessages(channel, interaction.options.getInteger('amount', true), interaction.user, messageReply as Message, (message: Message | PartialMessage) => message.content!.includes(includesText));
                break;
            case 'images':
                embed = await clearMessages(channel, interaction.options.getInteger('amount', true), interaction.user, messageReply as Message, (message: Message | PartialMessage) => message.attachments.some(attachment => attachment.contentType?.includes('image')));
                break;
        }
        await interaction.followUp({ embeds: [embed] }).then(message => {
            setTimeout(() => {
                if (message.deletable)
                message.delete().catch(console.error);
            }, 4000); // Delete the reponse message after 4 seconds
        });
    },
    cooldown: 10
}