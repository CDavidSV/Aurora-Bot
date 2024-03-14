import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import userSchema from "../../../schemas/userSchema";

export default {
    subCommand: 'user.info',
    callback: async (interaction: ChatInputCommandInteraction) => {
        const user = interaction.options.getUser('user', false) || interaction.user;
        const member = interaction.guild?.members.cache.get(user.id);

        
        const dbUser = await userSchema.findOne({ _id: user.id }).catch(console.error);
        const marriedUser = dbUser && dbUser.married_to_id ? await interaction.client.users.fetch(dbUser.married_to_id).catch(() => null) : null;

        const generalInfoString = `
        **Username: **${user.username}
        **Display Name: **${user.displayName}
        **ID: **${user.id}
        **Bot: **${user.bot ? "✔" : "✖"}
        **Color: **${member ? member.displayHexColor : 'No Color'}

        **Birthday: **${ dbUser && dbUser.birthday ? `<t:${Math.round(dbUser.birthday.getTime() / 1000)}:D>` : "Not set" }
        **Ocupation: ** ${ dbUser && dbUser.occupation ? dbUser.occupation : "Not set" }
        **Married to: **${ marriedUser ? marriedUser.displayName : "Not married" }`;
        const memberRoles = member ? member.roles.cache.map(role => `<@&${role.id}>`).join(', ') : 'Not in server';
        
        const avatarButton = new ButtonBuilder()
        .setCustomId(`userAvatar.${user.id}.new`)
        .setLabel('🖼️ Avatar')
        .setStyle(ButtonStyle.Primary)
        const bannerButton = new ButtonBuilder()
        .setCustomId(`userBanner.${user.id}`)
        .setLabel('🖼️ Banner')
        .setStyle(ButtonStyle.Primary)
        const userPermsButton = new ButtonBuilder()
        .setCustomId(`userPerms.${user.id}`)
        .setLabel('🔒 Permissions')
        .setStyle(ButtonStyle.Primary)

        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            avatarButton,
            bannerButton,
            userPermsButton
        );

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${user.displayName}` })
            .setThumbnail(user.avatarURL({ forceStatic: true })!)
            .setColor(member ? member.displayHexColor : 'Random')
            .setFields(
                { name: 'General User Info', value: generalInfoString, inline: false },
                { name: 'Discord Member Since', value: `<t:${Math.round(user.createdTimestamp / 1000)}> (<t:${Math.round(user.createdTimestamp / 1000)}:R>)`, inline: false },
                { name: 'Server Member Since', value: member ? `<t:${Math.round(member.joinedTimestamp! / 1000)}> (<t:${Math.round(member.joinedTimestamp! / 1000)}:R>)` : 'Not in server', inline: false },
                { name: 'Bot Member Since', value: dbUser ? `<t:${Math.round(dbUser.bot_member_since.getTime() / 1000)}> (<t:${Math.round(dbUser.bot_member_since.getTime() / 1000)}:R>)` : 'Never used', inline: false },
                { name: 'Roles', value: memberRoles, inline: false }
            )
            .setFooter({ text: interaction.client.user?.username!, iconURL: interaction.client.user?.avatarURL({ forceStatic: false })!})
        
        interaction.reply({ embeds: [embed], components: [row] }).catch(console.error);
    }
}