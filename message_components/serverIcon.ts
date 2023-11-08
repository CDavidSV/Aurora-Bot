import { ColorResolvable, MessageComponentInteraction, EmbedBuilder } from "discord.js";
import config from "../config.json";

export default {
    name: 'serverIcon',
    callback: async (interaction: MessageComponentInteraction) => {
        const guild = interaction.guild;
        if (!guild) return;

        const icon = guild.iconURL({ size: 4096 });

        if (!icon) {
            const errorEmbed = new EmbedBuilder()
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: 'This server does not have an icon', iconURL: config.embeds.colors.error })
            return await interaction.reply({ embeds: [errorEmbed] })
        };

        const embed = new EmbedBuilder()
            .setTitle(`${guild.name}'s Icon`)
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setImage(icon)
            .setFooter({ text: guild.name, iconURL: guild.iconURL()! })

        await interaction.reply({ embeds: [embed] });
    }
}