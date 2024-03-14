import { ButtonInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import config from '../config.json';

export default {
    name: 'userBanner',
    callback: async (interaction: ButtonInteraction) => {
        const userId: string = interaction.customId.split('.')[1];
        const user = await interaction.client.users.fetch(userId).catch(() => null);

        if (!user) {
            interaction.reply('User not found.').catch(console.error);
            return;
        }
        
        const banner = user.bannerURL({ size: 2048 });
        if (!banner) {
            if (user === interaction.user) {
                await interaction.reply(`**You** don't have a banner T_T`).catch(console.error);
                return;
            }

            await interaction.reply(`**${user.username}** does not have a banner.`);
            return;
        }

        const bannerEmbed = new EmbedBuilder()
            .setTitle(`${user.username}'s Banner`)
            .setImage(banner as string)
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(`[Banner URL](${banner as string})`)

        await interaction.reply({embeds: [bannerEmbed]});
    }
}