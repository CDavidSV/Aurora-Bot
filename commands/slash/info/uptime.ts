import { ColorResolvable, CommandInteraction, EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import config from "../../../config.json";

const calculateUptime = (startTime: number) => {
    const uptime = Date.now() - startTime;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor(uptime / 3600000) % 24;
    const min = Math.floor(uptime / 60000) % 60;
    const sec = Math.floor(uptime / 1000) % 60;

    let currentUptime: string = '';
    if (days !== 0) {
        currentUptime += `${days}d `;
    }
    if (hours !== 0) {
        currentUptime += `${hours}h `;
    }
    if (min !== 0) {
        currentUptime += `${min}m `;
    }
    currentUptime += `${sec}s`;

    return currentUptime;
}

export default {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription(`⏱️ Shows the bot's uptime`),
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    callback: async (interaction: CommandInteraction) => {
        const currentUptime = calculateUptime(interaction.client.startTime);

        const uptimeEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: interaction.client.user!.username, iconURL: interaction.client.user!.avatarURL({ forceStatic: false })! })
            .setFields(
                { name: "Local Time", value: `<t:${Math.round(Date.now() / 1000)}> `, inline: false },
                { name: "Current Uptime", value: `${currentUptime}`, inline: true },
                { name: "Start Time", value: `<t:${Math.round(interaction.client.startTime / 1000)}> `, inline: true }
            )
        await interaction.reply({ embeds: [uptimeEmbed], allowedMentions: { repliedUser: false } });
    }
}