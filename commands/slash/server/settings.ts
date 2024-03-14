import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../../../config.json";
import guildSchema from "../../../schemas/guildSchema";

export default {
    subCommand: 'server.settings',
    callback: async (interaction: ChatInputCommandInteraction) =>{
        const guildSettingsEmbed = new EmbedBuilder()
            .setTitle(interaction.guild!.name)
            .setThumbnail(interaction.guild!.iconURL()!)
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setFooter({ text: config.version })
            .setTimestamp()
            .setFields(
                { name: 'Welcome channel', value: 'Disabled', inline: true },
                { name: 'Goodbye channel', value: 'Disabled', inline: true },
                { name: 'Birthday channel', value: 'Disabled', inline: true },
                { name: 'Auto roles', value: 'Disabled', inline: true },
                { name: 'Auto nick', value: 'Disabled', inline: true }
            )
        
        // Fetch guild settings from database.
        const guildSettings = await guildSchema.findById(interaction.guild!.id);

        if (!guildSettings) return await interaction.reply({ embeds: [guildSettingsEmbed], ephemeral: true }); 
        
        const welcome_channel = guildSettings.welcome && guildSettings.welcome.welcome_channel ? `<#${guildSettings.welcome.welcome_channel}>` : 'Disabled';
        const goodbye_channel = guildSettings.goodbye && guildSettings.goodbye.goodbye_channel ? `<#${guildSettings.goodbye.goodbye_channel}>` : 'Disabled';
        const birthday_channel = guildSettings.bday && guildSettings.bday.channel ? `<#${guildSettings.bday.channel}>` : 'Disabled';
        const auto_roles = guildSettings.autorole && guildSettings.autorole.length >= 1 ? guildSettings.autorole.map(role => `<@&${role}>`).join(', ') : 'Disabled';
        const auto_nick = guildSettings.autonick ? guildSettings.autonick : 'Disabled';
        guildSettingsEmbed
            .setFields(
                { name: 'Welcome channel', value: welcome_channel, inline: true },
                { name: 'Goodbye channel', value: goodbye_channel, inline: true },
                { name: 'Birthday channel', value: birthday_channel, inline: true },
                { name: 'Auto roles', value: auto_roles, inline: false },
                { name: 'Auto nick', value: auto_nick, inline: true }
            )
        
        await interaction.reply({ embeds: [guildSettingsEmbed], ephemeral: true });
    }
}