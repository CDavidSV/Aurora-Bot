import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import userWarningsSchema from "../../../schemas/userWarningsSchema";
import config from "../../../config.json";

export default {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('⚠️ Warns a user. User warnings are stored using bot')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to warn. Mention or id.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the warning')
                .setMinLength(2)
                .setMaxLength(250)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction) => {
        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || "Not specified";

        let embed = new EmbedBuilder()
        .setAuthor({ name: 'Failed to create warning.', iconURL: config.embeds.images.errorImg })
        .setColor(config.embeds.colors.error as ColorResolvable)

        if (user.bot) {
            embed.setDescription("You can't warn a bot.");
            interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            return;
        }

        try {
            const guildUser = await interaction.guild?.members.fetch(user.id).then(() => true).catch(() => false);
            if (!guildUser) {
                embed.setDescription("This member is not in the server.");
                interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
                return;
            }

            userWarningsSchema.countDocuments({
                user_id: user.id,
                guild_id: interaction.guildId!
            }).then(count => {
                if (count >= 5000) {
                    userWarningsSchema.findOneAndDelete({ user_id: user.id, guild_id: interaction.guildId! }, { sort: { created_at: 1 } }).catch(console.error);
                }
            }).catch(console.error);

            await userWarningsSchema.create({
                user_id: user.id,
                guild_id: interaction.guildId!,
                reason,
                moderator_id: interaction.user.id,
                created_at: new Date()
            });
        } catch (err) {
            console.error(err);
            interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            return;
        }

        const warningEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.warning as ColorResolvable)
            .setAuthor({ name: `You have been warned in ${interaction.guild?.name}.`, iconURL: interaction.guild?.iconURL({ forceStatic: false })! })
            .setDescription(`****Reason:**** ${reason}`)
        
        try {
            await user.send({ embeds: [warningEmbed] });
        } catch (err) {
            console.error(err);
            embed
                .setAuthor({ name: 'Failed to notify the user.', iconURL: config.embeds.images.errorImg })
                .setDescription("The warning has been created, but the user has not been notified.")
                .setColor(config.embeds.colors.warning as ColorResolvable)

            interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
            return;
        }

        embed
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `Successfully warned ${user.username}.`, iconURL: user.avatarURL({ forceStatic: false })! })
            .setDescription(`****Reason:**** ${reason}`)

        interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);

        embed = new EmbedBuilder()
            .setAuthor({ name: `${user.username} has been warned.`, iconURL: user.avatarURL({ forceStatic: false })! })
            .setColor(config.embeds.colors.warning as ColorResolvable)
        
        interaction.channel!.send({ embeds: [embed] }).catch(console.error);
    },
    cooldown: 3
}