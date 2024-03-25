import { Role, EmbedBuilder, Client, ColorResolvable, PermissionFlagsBits } from 'discord.js';
import userSchema from '../schemas/userSchema';
import userWarningsSchema from '../schemas/userWarningsSchema';
import config from '../config.json';

const getRoleInfo = (role: Role) => {
    const name = role.name;
    const ID = role.id;
    const createdAt = Math.round(role.createdTimestamp / 1000);
    const memberSize = role.members.size;
    const color = role.color.toString(16);
    const position = role.position;

    let hoist: string;
    let managed: string;
    let mentionable: string;

    role.hoist ? hoist = '✓' : hoist = 'Χ';
    role.managed ? managed = '✓' : managed = 'Χ';
    role.mentionable ? mentionable = '✓' : mentionable = 'Χ';

    const roleEmbed = new EmbedBuilder()
        .setAuthor({ name: `${role.guild!.name}`, iconURL: role.guild?.iconURL({ forceStatic: false })! })
        .setFields(
            { name: 'Name', value: `${name}`, inline: true },
            { name: 'ID', value: `${ID}`, inline: true },
            { name: 'Creation Date', value: `<t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
            { name: 'Members in cache', value: `${memberSize}`, inline: true },
            { name: 'Position', value: `${position}`, inline: true },
            { name: 'Hex Color', value: `#${color.toUpperCase()}`, inline: true },
            { name: 'Hoisted', value: `${hoist}`, inline: true },
            { name: 'Managed', value: `${managed}`, inline: true },
            { name: 'Mantionable', value: `${mentionable}`, inline: true },
        )
        .setColor(role!.color);

    return roleEmbed;
}

/**
 * Converts seconds to a valid HH:MM:SS time format.
 * @param timestamp time value in miliseconds.
 */
const convertTime = (timestamp: number) => {
    const days = Math.floor(timestamp / 8.64e+7);
    const hours = Math.floor(timestamp % 8.64e+7 / 3.6e+6);
    const minutes = Math.floor(timestamp % 3.6e+6 / 60000);

    let timeStr = '';
    if (days > 0) {
        timeStr += `${days} days `;
    }

    if (hours > 0) {
        timeStr += `${hours} hours `;
    }

    if (minutes > 0) {
        timeStr += `${minutes} minutes`
    }

    return timeStr;
}

/**
 * 
 * @param duration Time duration e.g. (1m | 3h | 5d)
 * @param time Initial time value in ms.
 */
const getTimestampFromString = (duration: string, time: number = 0) => {
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
    return time;
}

/**
 * 
 * @param url url string
 * Validates an input string as a url.
 */
const isValidURL = (url: string) => {
    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

    return regex.test(url);
}

/**
 * 
 * @param hex color in hexadecimal value
 */
const isValidColorHex = (hex: string) => {
    const regex = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;

    return regex.test(hex);
}

/**
 * 
 * @param channelId 
 * @param client 
 */
const canRenameChannel = (channelId: string, client: Client) => {
    const channelCooldowns = client.channelCooldowns;
    const channelCooldown = channelCooldowns.get(channelId);
    let requestsMade = channelCooldown?.requests ?? 0;
    if (channelCooldown && channelCooldown.requests >= 2) { // 2 requests every 10 minutes
        return { canRename: false, message: `You can only rename a channel 2 times every 10 minutes. You may rename this channel again <t:${Math.round(channelCooldown.cooldown / 1000)}:R>` };
    }
    requestsMade++;
    channelCooldowns.set(channelId, { requests: requestsMade, cooldown: Date.now() + 600000 });

    return { canRename: true, message: '' };
};

/**
 * 
 * @param id 
 */
const createUser = (id: string) => {
    // Update the user in the database
    userSchema.findByIdAndUpdate(id, { _id: id }, { upsert: true, setDefaultsOnInsert: true, new: true }).catch(console.error);
};

/**
 * 
 * @param userId 
 * @param guildId 
 * @param client 
 * @param page 
 * @returns warnings for a user
 */
const getUserWarnings = async (userId: string, guildId: string, client: Client, page: number = 1) => {
    try {
        if (page < 1) page = 1;
        const query: any = [
            { $match: { user_id: userId, guild_id: guildId } },
            { $sort: { created_at: -1 } },
            { $skip: (page - 1) * 10 },
            { $limit: 10 },
            { $project: { id: { $toString: "$_id" }, reason: 1, moderator_id: 1, created_at: 1, _id: 0 } }
        ];

        const [ userWarningsCount, userWarnings ] = await Promise.all([
            userWarningsSchema.countDocuments({ user_id: userId, guild_id: guildId }),
            userWarningsSchema.aggregate(query)
        ]);
        const pages = Math.ceil(userWarningsCount / 10);

        const user = await client.users.fetch(userId);
        return { warnings: { 
            user: {
                userId: user.id,
                username: user.username,
                avatar: user.avatarURL({ forceStatic: false })!
            },
            count: userWarningsCount,
            countPerPage: 10,
            pages,
            page,
            data: userWarnings 
        }, error: null };
    } catch (err) {
        return { warnings: null, error: "Failed to fetch user warnings" };
    }
};

/**
 * 
 * @param warnings 
 * @param username 
 * @param userId 
 * @param iconUrl 
 * @returns constructed embed for warnings
 */
const constructWarningsEmbed = (warnings: any, username: string, userId: string, iconUrl: string) => {
    const pageEmbed = new EmbedBuilder()

    let maxCharactersReached = false;
    let warningsString = '';
    for (let i = 0; i < warnings.data.length; i++) {
        const stringToAppend = `**${warnings.page * warnings.countPerPage - (warnings.countPerPage - (i + 1))}.** ${warnings.data[i].reason} | **id:** ${warnings.data[i].id} | <t:${Math.round(warnings.data[i].created_at.getTime() / 1000)}:R> | <@${warnings.data[i].moderator_id}>\n`;
        if (warningsString.length + stringToAppend.length > 4096) {
            maxCharactersReached = true;
            pageEmbed
                .setColor(config.embeds.colors.main as ColorResolvable)
                .setAuthor({ name: `Warnings for ${username} (id: ${userId})`, iconURL: iconUrl })
                .setDescription(warnings.count === 0 ? "This user has no warnings." : `This user has **${warnings.count}** warnings:\n${warningsString}`)
                .setTimestamp()

            warningsString = '';
            break;
        };

        warningsString += stringToAppend;
    }

    if (maxCharactersReached) return pageEmbed;

    return pageEmbed
        .setColor(config.embeds.colors.main as ColorResolvable)
        .setAuthor({ name: `Warnings for ${username} (id: ${userId})`, iconURL: iconUrl })
        .setDescription(warnings.count === 0 ? "This user has no warnings." : `This user has **${warnings.count}** warnings:\n${warningsString}`)
        .setTimestamp()
};

/**
 * 
 * @param permission 
 * @returns Permission name
 */
const getPermissionName = (permission: bigint) => {
    for (const [key, value] of Object.entries(PermissionFlagsBits)) {
        if (value === permission) return key;
    }
};

export { getRoleInfo, convertTime, getTimestampFromString, isValidColorHex, isValidURL, canRenameChannel, createUser, getUserWarnings, constructWarningsEmbed, getPermissionName };