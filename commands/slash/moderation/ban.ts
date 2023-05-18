import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import config from "../../../config.json";

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🚫 Bans the selected member from the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User mention')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('reason')
                .setDescription('Reason for ban')
                .setRequired(false))
        .addStringOption(option =>
            option
                .setName('delete_messages')
                .setDescription('How much of their recent message history to delete.')
                .setChoices(
                    { name: "Previous Hour", value: "3600" }, 
                    { name: "Previous 6 Hours", value: "21600" },
                    { name: "Previous 12 Hours", value: "43200" },
                    { name: "Previous 24 Hours", value: "86400" },
                    { name: "Previous 3 Days", value: "259200" },
                    { name: "Previous 7 Days", value: "604800" }
                )
                .setRequired(false))
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction:  ChatInputCommandInteraction<CacheType>) => {
        // Create message embed.
        const banEmbed = new EmbedBuilder();

        const guild = interaction.guild;
        const user = interaction.options.getUser('user', true);
        const banReason = interaction.options.getString('reason') || "Not specified";
        const deleteMessagesTimeSec = interaction.options.getString('delete_messages') || "0";

        let member: GuildMember;
        try {
            member = await guild!.members.fetch(user.id);
        } catch {
            await interaction.reply({ content: "This member is not in the server.", ephemeral: true });
            return;
        }

        // Avoids user from banning moderators and administrators.
        if ((member!.permissions.has([PermissionFlagsBits.Administrator]) || !member!.bannable) && interaction.member!.user.id !== guild!.ownerId) {
            banEmbed
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: "You can't ban an Administrator.", iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [banEmbed] });
            return;
        }

        // Attempts to ban the user.
        interaction.guild?.members.ban(user, { deleteMessageSeconds: parseInt(deleteMessagesTimeSec), reason: banReason }).then(async () => {
            banEmbed
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `${user.tag} was banned for the server.`, iconURL: String(user.avatarURL({ forceStatic: false })) })
            .setDescription(`****Reason:**** ${banReason}`)
            await interaction.reply({ embeds: [banEmbed] });
        }).catch(async (err) => {
            console.log(err);
            banEmbed
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: "I'm Sorry but I can't ban this member right now.", iconURL: config.embeds.images.errorImg })
        await interaction.reply({ embeds: [banEmbed] });
        })
    }
}