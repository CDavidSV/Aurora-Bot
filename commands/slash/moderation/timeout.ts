import { CacheType, ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import config from "../../../config.json";
import { convertTime, getTimestampFromString } from "../../../util/herper-functions";

export default {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a member, so they cannot interact in the server for the specified time')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User mention')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('duration')
                .setMinLength(2)
                .setDescription('For how long to timeout the user. e.g. (1m | 3h | 5d)'))
        .addStringOption(option => 
            option
                .setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false))
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction:  ChatInputCommandInteraction<CacheType>) => {
        // Create message embed.
        const timeoutEmbed = new EmbedBuilder();

        const guild = interaction.guild;
        const user = interaction.options.getUser('user', true);
        const timeoutReason = interaction.options.getString('reason') || "Not specified";
        const duration = interaction.options.getString('duration') || "";
        const channel = interaction.channel!;

        let member: GuildMember;
        try {
            member = await guild!.members.fetch(user.id);
        } catch {
            await interaction.reply({ content: "This member is not in the server.", ephemeral: true });
            return;
        }

        // Avoids user from timing out moderators and administrators.
        if (member!.permissions.has(PermissionFlagsBits.Administrator)) {
            timeoutEmbed
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: "You can't timeout an Administrator", iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [timeoutEmbed], ephemeral: true });
            return;
        }

        const time = getTimestampFromString(duration, 300_000);

        // Attempts to ban the user.
        member.timeout(time, timeoutReason).then(async () => {
            timeoutEmbed
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `${user.username} was timed out.`, iconURL: user.avatarURL({ forceStatic: false })! })
            .setDescription(`****Reason:**** ${timeoutReason}\n**Duration:** \`${convertTime(time)}\``)

            await Promise.all([
                interaction.reply({ content: `${user.username} was timed out.`, ephemeral: true }),
                channel.send({ embeds: [timeoutEmbed] })
            ]);
        }).catch(async (err) => {
            console.log(err)
            timeoutEmbed
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: "I'm Sorry, but I can't timeout this member.", iconURL: config.embeds.images.errorImg })
            interaction.reply({ embeds: [timeoutEmbed] }).catch(console.error);
        })
    },
    cooldown: 3
}