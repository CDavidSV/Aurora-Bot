// Handles simple role commands (give, remove).

import { Client, Message, Permissions, MessageEmbed, MessageAttachment } from 'discord.js';

export default {
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        // All actions for role command.
        const actions = ['give','remove'];
        const { guild } = message;
        const roleAction = new MessageEmbed();
        const errorImg = new MessageAttachment('./assets/command-images/error-icon.png');
        const successImg = new MessageAttachment('./assets/command-images/success-icon.png');

        // Evaluate initial conditions (checks if the user has enogh permissions and that he has entered the correct commands or arguments)
        if (!message.member!.permissions.has([Permissions.FLAGS.MANAGE_ROLES])) {
            roleAction
                .setColor('#c9040e')
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({embeds: [roleAction], files: [errorImg]});
            return;
        }
        if (args.length <= 1 || !actions.includes(args[1])){
            roleAction
                .setColor('#c9040e')
                .setAuthor({ name: 'Esta acción no existe o no es especificada.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Trata ingresando: \`${prefix}role <give, remove> <@rol/rol>\``)
                message.reply({embeds: [roleAction], files: [errorImg]});
            return;
        }
        if (args.length <= 3) {
            roleAction
                .setColor('#c9040e')
                .setAuthor({ name: 'Esta acción requiere mencionar al usuario y nombrar el rol.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Trata ingresando:\`${prefix}role <give, remove> <@miembro> <@rol/rol>\``)
            message.reply({embeds: [roleAction], files: [errorImg]});
            return;
        }     

        // Get user ID from tag
        const userID = args[2].replace(/[<@!&>]/g,'');
        let member = guild!.members.cache.get(userID);

        // Get role ID from tag.
        const roleID = args[3].replace(/[<@!&>]/g,'');
        let role = guild!.roles.cache.get(roleID);

        if (!role) { // In case Role's name is typed instead of a mention.
            role = message.guild!.roles.cache.find(role => role.name.toLowerCase().includes(String(args.slice(3, args.length)).replace(',',' ')))!;
        }
        if (!member || !role) { // Checks if either the role or the user does not exist.
            roleAction
                .setColor('#c9040e')
                .setAuthor({ name: 'El rol o usuario no existe. Intenta mencionarlos.', iconURL: 'attachment://error-icon.png' })
                message.reply({embeds: [roleAction], files: [errorImg]});
            return;
        }
        
        // Checks if the user's role has enought rank to give the same role. (In case a user is trying to give his highest ranked role)
        if (message.member!.roles.highest <= role && message.member!.id !== guild!.ownerId) {
            roleAction
                .setColor('#c9040e')
                .setAuthor({ name: 'El rol está bloqueado porque es un rango más alto que tu rol más alto.', iconURL: 'attachment://error-icon.png' })
                message.reply({embeds: [roleAction], files: [errorImg]});
            return;
        }

        // Evaluate the selected action.
        switch(args[1].toLowerCase()) {
            case 'give': // gives specified role. Returns a promise to be evaluated
                member.roles.add(role).then(() => {
                    roleAction
                        .setColor('#00D915')
                        .setAuthor({ name: 'Rol agregado exitosamente.', iconURL: 'attachment://success-icon.png' })
                    message.channel.send({embeds: [roleAction], files: [successImg]})
                }).catch(() => {
                    roleAction
                        .setColor('#c9040e')
                        .setAuthor({ name: 'No tengo suficientes permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
                    message.channel.send({embeds: [roleAction], files: [errorImg]})    
                });
            break;
            case 'remove': // removes specified role.
                member.roles.remove(role).then(() => {
                    roleAction
                        .setColor('#00D915')
                        .setAuthor({ name: 'Rol removido exitosamente.', iconURL: 'attachment://success-icon.png' })
                    message.channel.send({embeds: [roleAction], files: [successImg]})
                }).catch(() => {
                    roleAction
                        .setColor('#c9040e')
                        .setAuthor({ name: 'No tengo suficientes permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
                    message.channel.send({embeds: [roleAction], files: [errorImg]})
                });
            break;
        }
    }
}