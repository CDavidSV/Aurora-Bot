// Handles simple role commands (give, remove).
import config from '../../config.json';
import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable } from 'discord.js';

export default {
    aliases: ['role'],
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        // Convert args to lowercase.
        args = args.map(arg => arg.toLowerCase());

        // All actions for role command.
        const actions = ['give', 'remove'];

        // Variables.
        const { guild } = message;
        const roleAction = new MessageEmbed();
        const errorImg = new MessageAttachment(config.embeds.errorImg);
        const successImg = new MessageAttachment(config.embeds.successImg);

        // Evaluate initial conditions (checks if the user has enogh permissions and that he has entered the correct commands or arguments)
        if (!message.member!.permissions.has([Permissions.FLAGS.MANAGE_ROLES])) {
            roleAction
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [roleAction], files: [errorImg] });
            return;
        }
        if (args.length <= 1 || !actions.includes(args[1])) {
            roleAction
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Esta acción no existe o no es especificada.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}role <give, remove> <@miembro> <@rol/rol>\``)
            message.reply({ embeds: [roleAction], files: [errorImg] });
            return;
        }
        if (args.length <= 3) {
            roleAction
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Esta acción requiere mencionar al usuario y nombrar el rol.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}role <give, remove> <@miembro> <@rol/rol>\``)
            message.reply({ embeds: [roleAction], files: [errorImg] });
            return;
        }

        // Get user ID from tag
        const userID = args[2].replace(/[<@!&>]/g, '');
        let member = guild!.members.cache.get(userID);

        // Get role ID from tag.
        const roleID = args[3].replace(/[<@!&>]/g, '');
        let role = guild!.roles.cache.get(roleID);

        if (!role) { // In case Role's name is typed instead of a mention.
            role = message.guild!.roles.cache.find(role => role.name.toLowerCase().includes(String(args.slice(3, args.length)).replace(',', ' ')))!;
        }
        if (!member || !role) { // Checks if either the role or the user does not exist.
            roleAction
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'El rol o usuario no existe. Intenta mencionarlos.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [roleAction], files: [errorImg] });
            return;
        }

        if (!guild!.me!.permissions.has([Permissions.FLAGS.MANAGE_ROLES])) {
            roleAction
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tengo permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [roleAction], files: [errorImg] });
            return;
        }

        // Checks if the user's role has enought rank to give the same role. (In case a user is trying to give his highest ranked role)
        if (message.member!.roles.highest <= role && message.member!.id !== guild!.ownerId) {
            roleAction
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'El rol está bloqueado porque es un rango más alto que tu rol más alto.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [roleAction], files: [errorImg] });
            return;
        }

        // Evaluate the selected action.
        switch (args[1].toLowerCase()) {
            case 'give': // gives specified role. Returns a promise to be evaluated
                member.roles.add(role).then(() => {
                    roleAction
                        .setColor(config.embeds.successColor as ColorResolvable)
                        .setAuthor({ name: 'Rol agregado exitosamente.', iconURL: 'attachment://success-icon.png' })
                    message.channel.send({ embeds: [roleAction], files: [successImg] })
                }).catch(() => {
                    roleAction
                        .setColor(config.embeds.errorColor as ColorResolvable)
                        .setAuthor({ name: 'No tengo suficientes permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
                    message.channel.send({ embeds: [roleAction], files: [errorImg] })
                });
                break;
            case 'remove': // removes specified role.
                member.roles.remove(role).then(() => {
                    roleAction
                        .setColor(config.embeds.successColor as ColorResolvable)
                        .setAuthor({ name: 'Rol removido exitosamente.', iconURL: 'attachment://success-icon.png' })
                    message.channel.send({ embeds: [roleAction], files: [successImg] })
                }).catch(() => {
                    roleAction
                        .setColor(config.embeds.errorColor as ColorResolvable)
                        .setAuthor({ name: 'No tengo suficientes permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
                    message.channel.send({ embeds: [roleAction], files: [errorImg] })
                });
                break;
        }
    }
}