import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ColorResolvable, EmbedBuilder } from "discord.js";
import config from '../config.json';

export default {
    name: 'userAvatar',
    callback: async (interaction: ButtonInteraction) => {
        const userId: string = interaction.customId.split('.')[1];
        const newMessage: boolean = interaction.customId.split('.')[2] === 'new';
        const user = await interaction.client.users.fetch(userId).catch(() => null);

        if (!user) return await interaction.update({ components: [] });
        
        let userAvatarLinks = `[jpg](${user.displayAvatarURL({size: 2048, extension: 'jpg', forceStatic: true})}) | [jpeg](${user.displayAvatarURL({size: 2048, extension: 'jpeg', forceStatic: true})}) | [png](${user.displayAvatarURL({size: 2048, extension: 'png', forceStatic: true})}) | [webp](${user.displayAvatarURL({size: 2048, extension: 'webp', forceStatic: true})})`;
        if (user.avatarURL()?.endsWith('.gif')) userAvatarLinks += ` | [gif](${user.displayAvatarURL({size: 2048, extension: 'gif'})})`;
        
        const avatarEmbed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({size: 2048}))
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(userAvatarLinks)

        if (user.displayAvatarURL({size: 2048}) === user.displayAvatarURL({size: 2048})) {
            if (newMessage) return await interaction.reply({ embeds: [avatarEmbed] });

            await interaction.update({ embeds: [avatarEmbed], components: [] });
        } else {
            const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`serverAvatar.${userId}`)
                    .setLabel('🖼️ View Server Avatar')
                    .setStyle(ButtonStyle.Primary),
            );
            
            if (newMessage) return await interaction.reply({ embeds: [avatarEmbed], components: [row] });

            await interaction.update({ embeds: [avatarEmbed], components: [row] });
        }
    }
}