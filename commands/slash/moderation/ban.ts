import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
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
            await interaction.reply({ embeds: [banEmbed], ephemeral: true });
            return;
        }

        // Attempts to ban the user.
        interaction.guild?.members.ban(user, { deleteMessageSeconds: parseInt(deleteMessagesTimeSec), reason: banReason }).then(async () => {
            banEmbed
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `${user.tag} was banned for the server.`, iconURL: String(user.avatarURL({ forceStatic: false })) })
            .setDescription(`****Reason:**** ${banReason}`)

            // Initialize unban button collector.
            const collector = interaction.channel!.createMessageComponentCollector({ 
                filter: (btnInteraction) => btnInteraction.customId === `user${interaction.id}`, 
                componentType: ComponentType.Button,
                time: 900_000
            });
    
            const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`user${interaction.id}`)
                    .setLabel('Unban User')
                    .setStyle(ButtonStyle.Primary),
            );

            await interaction.reply({ components: [row], embeds: [banEmbed] });

            collector.on('collect', async (interactionBtn: ButtonInteraction) => {
                if (interactionBtn.user.id !== interaction.user.id) {
                    await interactionBtn.reply({ content: `You do not have permission to run this command.`, ephemeral: true});
                    return;
                }

                row.components[0].setDisabled().setLabel('User unbanned');
                interaction.guild?.members.unban(user).then(async () => {
                    await interactionBtn.reply({ content: `${user.username} has been unbanned.`, ephemeral: true});
                }).catch(async () => {
                    await interactionBtn.reply({ content: `Unnable to unban user.`, ephemeral: true});
                });
                interactionBtn.message.edit({ components: [row], embeds: [banEmbed] }).catch((err) => console.error('Unnable to edit message: ', err));
                collector.stop();
                collector.removeAllListeners();
            });
        }).catch(async (err) => {
            console.log(err);
            banEmbed
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: "I'm Sorry but I can't ban this member.", iconURL: config.embeds.images.errorImg })
        await interaction.reply({ embeds: [banEmbed], ephemeral: true });
        })
    }
}