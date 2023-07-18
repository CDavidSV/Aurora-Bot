import { ChatInputCommandInteraction, ColorResolvable, PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import config from '../../../config.json';

export default {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite me to your server')
        .setDMPermission(true),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction) => {
        const inviteUrl = config.inviteLink;

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite Aurora :)')
                    .setURL(inviteUrl)
                    .setStyle(ButtonStyle.Link),
            );

        const inviteEmbed = new EmbedBuilder()
            .setAuthor({ name: `Aurora Bot Invite`, iconURL: interaction.client.user.avatarURL()!})
            .setDescription("I'm always happy to join another server :)")
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setTimestamp()

        await interaction.reply({embeds: [inviteEmbed], components: [row]});
    }
}