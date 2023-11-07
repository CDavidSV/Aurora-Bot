import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ColorResolvable, EmbedBuilder } from "discord.js";
import config from '../config.json';

export default {
    name: 'userAvatar',
    callback: async (interaction: ButtonInteraction) => {
        const userId: string = interaction.customId.split('.')[1];
        const member = interaction.guild?.members.cache.get(userId);

        if (!member) return await interaction.update({ components: [] });
        
        let userAvatarLinks = `[jpg](${member.user.displayAvatarURL({size: 2048, extension: 'jpg', forceStatic: true})}) | [jpeg](${member.user.displayAvatarURL({size: 2048, extension: 'jpeg', forceStatic: true})}) | [png](${member.user.displayAvatarURL({size: 2048, extension: 'png', forceStatic: true})}) | [webp](${member.user.displayAvatarURL({size: 2048, extension: 'webp', forceStatic: true})})`;
        if (member.user.avatarURL()?.endsWith('.gif')) userAvatarLinks += ` | [gif](${member.user.displayAvatarURL({size: 2048, extension: 'gif'})})`;
        
        const avatarEmbed = new EmbedBuilder()
            .setTitle(`${member.user.username}'s Avatar`)
            .setImage(member.user.displayAvatarURL({size: 2048}))
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(userAvatarLinks)

        if (member.displayAvatarURL({size: 2048}) === member.user.displayAvatarURL({size: 2048})) {
            await interaction.update({ embeds: [avatarEmbed], components: [] });
        } else {
            const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`serverAvatar.${userId}`)
                    .setLabel('View Server Avatar')
                    .setStyle(ButtonStyle.Primary),
            );
        
            await interaction.update({ embeds: [avatarEmbed], components: [row] });
        }
    }
}