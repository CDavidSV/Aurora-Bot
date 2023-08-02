import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import config from "../../../config.json";

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('👟 Kicks the selected member from the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User mention')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('reason')
                .setDescription('Reason for kick')
                .setRequired(false))
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.KickMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction:  ChatInputCommandInteraction<CacheType>) => {
        // Create message embed.
        const banEmbed = new EmbedBuilder();

        const guild = interaction.guild;
        const user = interaction.options.getUser('user', true);
        const banReason = interaction.options.getString('reason') || "Not specified";

        let member: GuildMember;
        try {
            member = await guild!.members.fetch(user.id);
        } catch {
            await interaction.reply({ content: "This member is not in the server.", ephemeral: true });
            return;
        }

        // Avoids user from banning moderators and administrators.
        if ((member!.permissions.has([PermissionFlagsBits.Administrator]) || !member!.kickable)) {
            banEmbed
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: "You can't kick an Administrator.", iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [banEmbed], ephemeral: true });
            return;
        }

        // Attempts to ban the user.
        member.kick(banReason).then(async () => {
            banEmbed
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `${user.username} was kicked from the server.`, iconURL: String(user.avatarURL({ forceStatic: false })) })
            .setDescription(`****Reason:**** ${banReason}`)
            await interaction.reply({ embeds: [banEmbed] });
        }).catch(async (err) => {
            console.log(err);
            banEmbed
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: "I'm Sorry but I can't kick this member.", iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [banEmbed], ephemeral: true }).catch(console.error);
        })
    }
}