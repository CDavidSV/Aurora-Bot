import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../../../config.json";

export default {
    subCommand: 'server.info',
    callback: async (interaction: ChatInputCommandInteraction) => {
        const guild = interaction.guild;

        if (!guild) return await interaction.reply('This command can only be used in a server.');

        const embed = new EmbedBuilder()
            .setColor(config.embeds.colors.main as ColorResolvable) 
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '🆔 ID', value: `${guild.id}`, inline: true },
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '📆 Creation Date', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}>`, inline: true },
                { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                { name: '😃 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🔒 Verification Level', value: `${guild.verificationLevel}`, inline: true },
                { name: '✅ Verified', value: guild.verified ? '✔' : '✖', inline: true },
                { name: '🤝 Partnered', value: guild.partnered ? '✔' : '✖', inline: true },
                { name: '📜 Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '🎤 Stage Instances', value: `${guild.stageInstances.cache.size}`, inline: true },
                { name: '🖼️ Stickers', value: `${guild.stickers.cache.size}`, inline: true },
            )
            .setTimestamp()

        // Add two buttons for server image and banner.
        const buttonIcon = new ButtonBuilder()
            .setCustomId('serverIcon')
            .setLabel('Server Icon')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🖼️')
            .setDisabled(!guild.iconURL());
        
        const buttonBanner = new ButtonBuilder()
            .setCustomId('serverBanner')
            .setLabel('Server Banner')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🖼️')
            .setDisabled(!guild.bannerURL());

        const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(buttonIcon, buttonBanner);

        await interaction.reply({ embeds: [embed], components: [row] });
    }
}