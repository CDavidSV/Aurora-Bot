import { CacheType, ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import config from "../../../config.json";


/**
 * Converts seconds to a valid HH:MM:SS time format.
 * @param timestamp time value in miliseconds.
 */
function convertTime(timestamp: number) {
    const days = Math.floor(timestamp / 8.64e+7);
    const hours = Math.floor(timestamp % 8.64e+7 / 3.6e+6);
    const minutes = Math.floor(timestamp % 3.6e+6 / 60000);

    let timeStr = '';
    if (days > 0) {
        timeStr += `${days} days`;
    }

    if (hours > 0) {
        timeStr += ` ${hours} hours`;
    }

    if (minutes > 0) {
        timeStr += ` ${minutes} minutes`
    }

    return timeStr;
}

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

        let time = 300000;
        const matches = duration.toLowerCase().match(/((\d+d\s?)|(\d+h\s?)|(\d+m\s?)|(\d+s\s?))/g);
        if (matches) {
            time = 0;
            for (let match of matches) {
                const num = parseInt(match.slice(0,-1));
                switch(match.slice(-1)) {
                    case "d":
                        time += num * 8.64e+7;
                        break;
                    case "h":
                        time += num * 3.6e+6;
                        break;
                    case "m":
                        time += num * 60000;
                        break;
                }
            }
        }

        // Attempts to ban the user.
        member.timeout(time, timeoutReason).then(async () => {
            timeoutEmbed
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: `${user.tag} was timed out.`, iconURL: String(user.avatarURL({ forceStatic: false })) })
            .setDescription(`****Reason:**** ${timeoutReason}\n**Duration: ${convertTime(time)}**`)

            await interaction.reply({ embeds: [timeoutEmbed] });
        }).catch(async (err) => {
            console.log(err)
            timeoutEmbed
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: "I'm Sorry, but I can't timeout this member.", iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [timeoutEmbed] });
        })
    }
}