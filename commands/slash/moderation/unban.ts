import { CacheType, ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import config from "../../../config.json";

export default {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('✅ Unbans a user from the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User id. e.g. 1101954090667348029')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('reason')
                .setDescription('Reason for the unban')
                .setRequired(false))
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages ],
    callback: async (interaction:  ChatInputCommandInteraction<CacheType>) => {
        // Create message embed.
        const unbanEmbed = new EmbedBuilder();

        const user = interaction.options.getUser('user', true);
        const unbanReason = interaction.options.getString('reason') || "Not specified";

        // Attempts to ban the user.
        interaction.guild?.members.unban(user, unbanReason).then(async () => {
            unbanEmbed
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `${user.username} was unbanned from the server.`, iconURL: String(user.avatarURL({ forceStatic: false })) })
            .setDescription(`****Reason:**** ${unbanReason}`)

            await interaction.reply({ embeds: [unbanEmbed], ephemeral: true });
        }).catch(async () => {
            unbanEmbed
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: "I'm Sorry, but I can't unban this member.", iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [unbanEmbed], ephemeral: true }).catch(console.error);
        })
    }
}