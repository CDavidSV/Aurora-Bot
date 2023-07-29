import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ColorResolvable, CommandInteraction, ComponentType, EmbedBuilder, GuildMember } from "discord.js";
import config from "../../../config.json";

export default {
    subCommand: "user.avatar",
    callback: async (interaction: CommandInteraction) => {
        const avatarEmbed = new EmbedBuilder();
    
        let member: GuildMember;
        if(!interaction.options.getUser('user')) {
            member = interaction.guild!.members.cache.get(interaction.member!.user.id)!;
        } else {
            member = interaction.guild!.members.cache.get(interaction.options.getUser('user')!.id) as GuildMember;
        }

        if (!member) {
            await interaction.reply({ content: "That user is not in this server.", ephemeral: true });
            return;
        }

        let userAvatarLinks = `[jpg](${member.user.displayAvatarURL({size: 2048, extension: 'jpg', forceStatic: true})}) | [jpeg](${member.user.displayAvatarURL({size: 2048, extension: 'jpeg', forceStatic: true})}) | [png](${member.user.displayAvatarURL({size: 2048, extension: 'png', forceStatic: true})}) | [webp](${member.user.displayAvatarURL({size: 2048, extension: 'webp', forceStatic: true})})`;
        let guildAvatarLinks = `[jpg](${member.displayAvatarURL({size: 2048, extension: 'jpg', forceStatic: true})}) | [jpeg](${member.displayAvatarURL({size: 2048, extension: 'jpeg', forceStatic: true})}) | [png](${member.displayAvatarURL({size: 2048, extension: 'png', forceStatic: true})}) | [webp](${member.displayAvatarURL({size: 2048, extension: 'webp', forceStatic: true})})`;

        if (member.user.avatarURL()?.endsWith('.gif')) userAvatarLinks += ` | [gif](${member.user.displayAvatarURL({size: 2048, extension: 'gif'})})`;
        if (member.avatarURL()?.endsWith('.gif')) guildAvatarLinks += ` | [gif](${member.user.displayAvatarURL({size: 2048, extension: 'gif'})})`;

        avatarEmbed
            .setTitle(`${member.user.username}'s Server Avatar`)
            .setImage(member.displayAvatarURL({size: 2048}))
            .setColor(config.embeds.colors.main as ColorResolvable)
        
        if(member.displayAvatarURL({size: 2048}) === member.user.displayAvatarURL({size: 2048})) {
            avatarEmbed.setDescription(userAvatarLinks)
            await interaction.reply({embeds: [avatarEmbed]});
        } else {
            avatarEmbed.setDescription(guildAvatarLinks);

            const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`userAvatar.${member.user.id}`)
                    .setLabel('View User Avatar')
                    .setStyle(ButtonStyle.Primary),
            );

            // Disable the button after one hour
            await interaction.reply({embeds: [avatarEmbed], components: [row], fetchReply: true });
        }
    }
}