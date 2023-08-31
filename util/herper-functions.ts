import { Role, EmbedBuilder } from 'discord.js';

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

export { getRoleInfo, convertTime, getTimestampFromString, isValidColorHex, isValidURL };