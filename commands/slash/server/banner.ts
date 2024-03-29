import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import config from '../../../config.json';

export default {
    subCommand: "server.banner",
    callback: async (interaction: ChatInputCommandInteraction) => {
        const guild = interaction.guild;
        if (!guild) return;

        const banner = guild.bannerURL({ size: 4096 });
        if (!banner) {
            const errorEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: 'This server does not have a banner', iconURL: config.embeds.images.errorImg })
            return await interaction.reply({ embeds: [errorEmbed] })
        };

        const embed = new EmbedBuilder()
        .setTitle(`${guild.name}'s Banner`)
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setImage(banner)
            .setFooter({ text: guild.name, iconURL: guild.iconURL()! })

        await interaction.reply({ embeds: [embed] });
    }
}