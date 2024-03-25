import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import config from "../../../config.json";
import { set } from "mongoose";

export default {
    data: new SlashCommandBuilder()
        .setName('softban')
        .setDescription('🔨 Bans and unbans a user. Deletes messages from the user in the last 7 days.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to softban. Mention or id.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the softban.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.BanMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction) => {
        // Create message embed.
        const banEmbed = new EmbedBuilder();

        const guild = interaction.guild;
        const user = interaction.options.getUser('user', true);
        const banReason = interaction.options.getString('reason') || "Not specified";
        const channel = interaction.channel!;

        let member: GuildMember;
        try {
            member = await guild!.members.fetch(user.id);
        } catch {
            await interaction.reply({ content: "This member is not in the server.", ephemeral: true });
            return;
        }

        // Avoids user from banning moderators and administrators.
        if ((member!.permissions.has([PermissionFlagsBits.Administrator]) || !member!.bannable)) {
            banEmbed
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: "You can't ban an Administrator.", iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [banEmbed], ephemeral: true });
            return;
        }

        // Send a message to the banned user.
        const userEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `You have been softbanned from ${interaction.guild?.name}.`, iconURL: interaction.guild?.iconURL({ forceStatic: false })! })
            .setDescription(`****Reason:**** ${banReason}`)
            .setFooter({ text: `If you think this was a mistake, please contact the server's moderators.` });

        await user.send({ embeds: [userEmbed] }).catch(console.error);

        // Ban the user.
        interaction.guild?.members.ban(user, { deleteMessageSeconds: 604800, reason: banReason }).then(async () => {
            banEmbed
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `${user.username} was softbanned for the server.`, iconURL: user.avatarURL({ forceStatic: false })! })
            .setDescription(`****Reason:**** ${banReason}`)

            // Initialize unban button collector.
            interaction.channel!.createMessageComponentCollector({ 
                filter: (btnInteraction) => btnInteraction.customId === `user${interaction.id}`, 
                componentType: ComponentType.Button,
                time: 900_000
            });
            
            interaction.reply({ content: `The user ${user.username} (id: ${user.id}) has been softbanned from this server`, ephemeral: true }).catch(console.error);
            channel.send({ embeds: [banEmbed] }).catch(console.error);
            setTimeout(() => {
                interaction.guild?.members.unban(user).catch(console.error);
            }, 10_000);
        }).catch(async (err) => {
            console.log(err);
            banEmbed
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: "I'm Sorry but I can't ban this member.", iconURL: config.embeds.images.errorImg })
            interaction.reply({ embeds: [banEmbed], ephemeral: true }).catch(console.error);
        });
    }
}