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
        const kickEmbed = new EmbedBuilder();

        const guild = interaction.guild;
        const user = interaction.options.getUser('user', true);
        const kickReason = interaction.options.getString('reason') || "Not specified";
        const channel = interaction.channel!;

        let member: GuildMember;
        try {
            member = await guild!.members.fetch(user.id);
        } catch {
            await interaction.reply({ content: "This member is not in the server.", ephemeral: true });
            return;
        }

        // Avoids user from banning moderators and administrators.
        if ((member!.permissions.has([PermissionFlagsBits.Administrator]) || !member!.kickable)) {
            kickEmbed
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: "You can't kick an Administrator.", iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [kickEmbed], ephemeral: true });
            return;
        }

        // Send a DM to the user.
        const userEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `You have been kicked from ${interaction.guild?.name}.`, iconURL: interaction.guild?.iconURL({ forceStatic: false })! })
            .setDescription(`****Reason:**** ${kickReason}`)
            .setFooter({ text: `If you think this was a mistake, please contact the server's moderators.` });
        
        await user.send({ embeds: [userEmbed] }).catch(console.error);
        
        // Attempts to ban the user.
        member.kick(kickReason).then(async () => {
            kickEmbed
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `${user.username} was kicked from the server.`, iconURL: user.avatarURL({ forceStatic: false })! })
            .setDescription(`****Reason:**** ${kickReason}`)

            interaction.reply({ content: `The user ${user.username} (id: ${user.id}) has been kicked from the server`, ephemeral: true }).catch(console.error);
            channel.send({ embeds: [kickEmbed] }).catch(console.error);
        }).catch(async (err) => {
            console.log(err);
            kickEmbed
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: "I'm Sorry but I can't kick this member.", iconURL: config.embeds.images.errorImg })
            interaction.reply({ embeds: [kickEmbed], ephemeral: true }).catch(console.error);
        });
    }
}