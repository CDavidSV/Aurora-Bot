// Handles simple role commands (give, remove).

import { Client, Message, Permissions, MessageEmbed} from 'discord.js';

export default {
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        // All actions for role command.
        const actions = ['give','remove', 'has', 'info'];
        const { guild } = message;

        if (!message.member!.permissions.has([Permissions.FLAGS.MANAGE_ROLES])) {
            message.reply('No tienes permiso para usar este comando.');
            return;
        }  
        if (args.length <= 1 || !actions.includes(args[1])){
            message.reply(`Esta acción no existe o no es especificada.\nTrata ingresando: \`${prefix}role <give, remove>\``);
            return;
        }
        if (args.length <= 3) {
            message.reply(`Esta acción requiere argumentos\nTrata ingresando:\`${prefix}role <give, remove> <@Usuario> <@rol>\``);
            return;
        }     

        // Get user ID from tag
        const userID = args[2].replace(/[<@!&>]/g,'');
        let member = guild!.members.cache.get(userID)!;

        // Get role ID from tag.
        const roleID = args[3].replace(/[<@!&>]/g,'');
        let role = guild!.roles.cache.get(roleID)!;

        if (!member) {
            member = message.guild!.members.cache.find(member => member.displayName.toLowerCase().includes(args[2]))!;  
        } 
        if (!role) {
            role = message.guild!.roles.cache.find(role => role.name.toLowerCase().includes(args[3]))!;
        }

        if (!member || !role) {
            message.reply('El usuario o rol no existe. Intenta mencionarlos.');
            return;
        }
        switch(args[1].toLowerCase()) {
            case 'give':
                member.roles.add(role);
                const roleAdded = new MessageEmbed()
                    .setColor('#00D915')
                    .setDescription('Rol agregado con éxito.')
                message.channel.send({embeds: [roleAdded]});
                break;
            case 'remove':
                member.roles.remove(role);
                const roleRemoved = new MessageEmbed()
                    .setColor('#00D915')
                    .setDescription('Rol removido con éxito.')
                message.channel.send({embeds: [roleRemoved]});
                break;
        }
    }
}