import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, CommandInteraction, EmbedBuilder, GuildMember } from "discord.js";
import config from "../../../config.json";

export default {
    subCommand: "user.avatar",
    callback: async (interaction: CommandInteraction) => {
        const avatarEmbed = new EmbedBuilder();
    
        let member: GuildMember;
        const user = interaction.options.getUser('user') || interaction.user;
        member = interaction.guild!.members.cache.get(user.id) as GuildMember;

        let userAvatarLinks = `[jpg](${user.displayAvatarURL({size: 2048, extension: 'jpg', forceStatic: true})}) | [jpeg](${user.displayAvatarURL({size: 2048, extension: 'jpeg', forceStatic: true})}) | [png](${user.displayAvatarURL({size: 2048, extension: 'png', forceStatic: true})}) | [webp](${user.displayAvatarURL({size: 2048, extension: 'webp', forceStatic: true})})`;
        if (user.avatarURL()?.endsWith('.gif')) userAvatarLinks += ` | [gif](${user.displayAvatarURL({size: 2048, extension: 'gif'})})`;

        if (!member) {
            avatarEmbed
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({size: 2048}))
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(userAvatarLinks)
            return await interaction.reply({embeds: [avatarEmbed]});
        }

        let guildAvatarLinks = `[jpg](${member.displayAvatarURL({size: 2048, extension: 'jpg', forceStatic: true})}) | [jpeg](${member.displayAvatarURL({size: 2048, extension: 'jpeg', forceStatic: true})}) | [png](${member.displayAvatarURL({size: 2048, extension: 'png', forceStatic: true})}) | [webp](${member.displayAvatarURL({size: 2048, extension: 'webp', forceStatic: true})})`;
        if (member.avatarURL()?.endsWith('.gif')) guildAvatarLinks += ` | [gif](${user.displayAvatarURL({size: 2048, extension: 'gif'})})`;

        avatarEmbed
            .setTitle(`${user.username}'s Server Avatar`)
            .setImage(member.displayAvatarURL({size: 2048}))
            .setColor(config.embeds.colors.main as ColorResolvable)
        
        if (member.displayAvatarURL({size: 2048}) === user.displayAvatarURL({size: 2048})) {
            avatarEmbed.setDescription(userAvatarLinks)
            await interaction.reply({embeds: [avatarEmbed]});
        } else {
            avatarEmbed.setDescription(guildAvatarLinks);

            const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`userAvatar.${user.id}`)
                    .setLabel('View User Avatar')
                    .setStyle(ButtonStyle.Primary),
            );

            // Disable the button after one hour
            await interaction.reply({embeds: [avatarEmbed], components: [row], fetchReply: true });
        }
    }
}