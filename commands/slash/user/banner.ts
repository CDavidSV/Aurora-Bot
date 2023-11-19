import { ColorResolvable, CommandInteraction, EmbedBuilder, GuildMember, User } from "discord.js";
import config from "../../../config.json";

export default {
    subCommand: "user.banner",
    callback: async (interaction: CommandInteraction) => {
        const bannerEmbed = new EmbedBuilder();
    
        const user = await interaction.options.getUser('user')?.fetch() || await interaction.user.fetch();

        if (!user) {
            await interaction.reply('User not found.');
            return;
        }
        
        const banner = user.bannerURL({ size: 2048 });
        console.log(banner);
        if (!banner) {
            if (user === interaction.user) {
                await interaction.reply(`**You** don't have a banner T_T`);
                return;
            }

            await interaction.reply(`**${user.username}** does not have a banner.`);
            return;
        }

        bannerEmbed
            .setTitle(`${user.username}'s Banner`)
            .setImage(banner as string)
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(`[Banner URL](${banner as string})`)

        await interaction.reply({embeds: [bannerEmbed]});
    }
}