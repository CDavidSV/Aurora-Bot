import { ColorResolvable, CommandInteraction, EmbedBuilder, GuildMember, User } from "discord.js";
import config from "../../../config.json";
import axios from "axios";

export default {
    subCommand: "user.banner",
    callback: async (interaction: CommandInteraction) => {
        const bannerEmbed = new EmbedBuilder();
    
        const id = interaction.options.getUser('user') || interaction.member?.user.id;

        const user = await axios('https://discord.com/api/users/' + id, {
            headers: {
              Authorization: `Bot ${process.env.TOKEN}`,
            },
        }).then((res) => res.data).catch(() => null);

        if (!user) {
            await interaction.reply('An Error Ocurred. Please try again.');
            return;
        }
        
        if (!user.banner) {
            if (user === interaction.user) {
                await interaction.reply(`**You** don't have a banner silly T_T`);
                return;
            }

            await interaction.reply(`**${user.username}** does not have a banner.`);
            return;
        }

        const bannerUrl = `https://cdn.discordapp.com/banners/${user.id}/${user.banner}?size=2048`;

        bannerEmbed
            .setTitle(`${user.username}'s Banner`)
            .setImage(bannerUrl)
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(`[Image URL](${bannerUrl})`)

        await interaction.reply({embeds: [bannerEmbed]});
    }
}