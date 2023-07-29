import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ColorResolvable, EmbedBuilder } from "discord.js";
import config from '../config.json';

export default {
    name: 'serverAvatar',
    callback: async (interaction: ButtonInteraction) => {
        const userId: string = interaction.customId.split('.')[1];
        const member = interaction.guild?.members.cache.get(userId);

        if (!member) return await interaction.update({ components: [] }).catch(console.error);
        if (member.displayAvatarURL({size: 2048}) === member.user.displayAvatarURL({size: 2048})) return await interaction.update({ components: [] }).catch(console.error);
        
        let guildAvatarLinks = `[jpg](${member.displayAvatarURL({size: 2048, extension: 'jpg', forceStatic: true})}) | [jpeg](${member.displayAvatarURL({size: 2048, extension: 'jpeg', forceStatic: true})}) | [png](${member.displayAvatarURL({size: 2048, extension: 'png', forceStatic: true})}) | [webp](${member.displayAvatarURL({size: 2048, extension: 'webp', forceStatic: true})})`;
        if (member.avatarURL()?.endsWith('.gif')) guildAvatarLinks += ` | [gif](${member.user.displayAvatarURL({size: 2048, extension: 'gif'})})`;
        
        const avatarEmbed = new EmbedBuilder()
            .setTitle(`${member.user.username}'s Server Avatar`)
            .setImage(member.displayAvatarURL({size: 2048}))
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(guildAvatarLinks)

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`userAvatar.${userId}`)
                    .setLabel('View User Avatar')
                    .setStyle(ButtonStyle.Primary),
            );
        
        interaction.update({ embeds: [avatarEmbed], components: [row] }).catch(console.error);
    }
}