// Displays all roles for the specified user.
import config from '../../config.json';
import { Client, Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField } from 'discord.js';

export default {
    aliases: ['roles'],
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        // Convert args to lowercase.
        args = args.map(arg => arg.toLowerCase());

        // Variables.
        const { guild } = message;
        const rolesEmbed = new EmbedBuilder();
        const errorImg = new AttachmentBuilder(config.embeds.images.errorImg);

        // Evaluate initial conditions (checks if the user has enogh permissions and that he has entered the correct commands or arguments)
        if (!message.member!.permissions.has([PermissionsBitField.Flags.ManageRoles])) {
            rolesEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [rolesEmbed], files: [errorImg] });
            return;
        }
        if (args.length <= 1) {

            const roles = message.guild!.roles.cache.map(role => { return role.id });
            let displayedRoles = '';

            for (let role = 0; role < roles.length; role++) {
                displayedRoles += `${role + 1}. <@&${roles[role]}>\n`;
            }

            rolesEmbed
                .setColor(config.embeds.colors.defaultColor as ColorResolvable)
                .setTitle(`Roles en ${message.guild!.name} [${roles.length}]`)
                .setDescription(displayedRoles)
                .setThumbnail(message.guild!.iconURL({ forceStatic: false })!)
            message.channel.send({ embeds: [rolesEmbed] });
            return;
        }

        // Get user ID from tag
        const userID = args[1].replace(/[<@!&>]/g, '');
        let member = guild!.members.cache.get(userID);

        const memberRoles = member!.roles.cache.map(role => { return role.id });
        let displayedRoles = '';

        for (let role = 0; role < memberRoles.length; role++) {
            displayedRoles += `${role + 1}. <@&${memberRoles[role]}>\n`;
        }

        rolesEmbed
            .setColor(config.embeds.colors.defaultColor as ColorResolvable)
            .setAuthor({ name: `${message.guild!.name}`, iconURL: message.guild!.iconURL()! })
            .setTitle(`Roles de ${member!.user.tag} [${memberRoles.length}]`)
            .setDescription(displayedRoles)
            .setThumbnail(member!.displayAvatarURL({ forceStatic: false }))
        message.channel.send({ embeds: [rolesEmbed] });
    }
}