import { CacheType, ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import config from "../../../config.json";

export default {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Untimeout a user.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User mention')
                .setRequired(true))
        .addStringOption(option => 
            option
                .setName('reason')
                .setDescription('Reason for the untimeout')
                .setRequired(false))
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction:  ChatInputCommandInteraction<CacheType>) => {
        // Create message embed.
        const timeoutEmbed = new EmbedBuilder();

        const guild = interaction.guild;
        const user = interaction.options.getUser('user', true);
        const untimeoutReason = interaction.options.getString('reason') || "Not specified";

        let member: GuildMember;
        try {
            member = await guild!.members.fetch(user.id);
        } catch {
            await interaction.reply({ content: "This member is not in the server.", ephemeral: true });
            return;
        }

        // Attempts to ban the user.
        member.timeout(null, untimeoutReason).then(async () => {
            timeoutEmbed
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `Removed timeout from ${user.tag}.`, iconURL: String(user.avatarURL({ forceStatic: false })) })

            await interaction.reply({ embeds: [timeoutEmbed] });
        }).catch(async () => {
            timeoutEmbed
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: "I'm Sorry, but I can't untimeout this member.", iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [timeoutEmbed] });
        })
    }
}