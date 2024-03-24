import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import config from "../../../config.json";
import userWarningsSchema from "../../../schemas/userWarningsSchema";

export default {
    data: new SlashCommandBuilder()
        .setName('clearwarn')
        .setDescription('🗑️ Clears all warnings from a user.')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to clear warnings from. Mention or id.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction) => {
        const user = interaction.options.getUser('user', true);
        let embed = new EmbedBuilder()
        .setAuthor({ name: 'Failed to clear user warnings.', iconURL: config.embeds.images.errorImg })
        .setColor(config.embeds.colors.error as ColorResolvable)

        if (user.bot) {
            embed.setDescription("This user is a bot.");
            interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            return;
        }

        try {
            const warningsDeleted = await userWarningsSchema.deleteMany({ 
                user_id: user.id,
                guild_id: interaction.guildId!
            }).exec();

            if (warningsDeleted.deletedCount === 0) {
                embed = new EmbedBuilder()
                .setAuthor({ name: `${user.username} Has no warnings for this server`, iconURL: config.embeds.images.errorImg })
                .setColor(config.embeds.colors.warning as ColorResolvable)

                interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
                return;
            }

            embed = new EmbedBuilder()
                .setColor(config.embeds.colors.success as ColorResolvable)
                .setAuthor({ name: `Cleared warnings from ${user.username}.`, iconURL: user.avatarURL({ forceStatic: false })! })
                .setDescription(`Cleared ${warningsDeleted.deletedCount} warnings.`);

            interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
        } catch {
            embed.setDescription("This member is not in the server.");
            interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            return;
        }

    },
    cooldown: 10
}