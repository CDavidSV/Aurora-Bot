import { ColorResolvable, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import config from "../../../config.json";

export default {
    subCommand: "user.banner",
    callback: (interaction: CommandInteraction) => {
        const bannerEmbed = new EmbedBuilder();
    
        let member: GuildMember;
        if(!interaction.options.getUser('user')) {
            member = interaction.guild!.members.cache.get(interaction.member!.user.id)!;
        } else {
            member = interaction.guild!.members.cache.get(interaction.options.getUser('user')!.id) as GuildMember;
        }
        
        if (!member.user.bannerURL()) {
            if (member.user === interaction.user) {
                interaction.reply(`**You** don't have a banner silly T_T`);
                return;
            }

            interaction.reply(`**${member.displayName}** does not have a banner.`);
            return;
        }

        bannerEmbed
            .setTitle(`${member.user.username}'s Banner`)
            .setImage(member.displayAvatarURL({size: 2048}))
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(`[Image URL](${member.user.bannerURL({size: 2048})})`)

        interaction.reply({embeds: [bannerEmbed]});
    }
}