// Gives the specified role to a user.
import config from '../../config.json';
import { Client, Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField, SlashCommandBuilder, ChatInputCommandInteraction, CacheType, userMention } from 'discord.js';
import MCommand from '../../Classes/MCommand';

// Variables.
const errorImg = new AttachmentBuilder(config.embeds.images.errorImg);
const successImg = new AttachmentBuilder(config.embeds.images.successImg);

export default {
    data: new SlashCommandBuilder()
        .setName('giverole')
        .setDescription('Gives the specified role to a user.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User Mention.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role Mention.')
                .setRequired(true))
        .setDMPermission(false),
    aliases: ['giverole', 'grantrole'],
    category: 'Gestión de roles',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageRoles],
    userPerms: [PermissionsBitField.Flags.ManageRoles],
    cooldown: 0,
    commandType: 'Slash&Prefix',

    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        const roleAction = new EmbedBuilder();

        // Convert args to lowercase.
        args = args.map(arg => arg.toLowerCase());

        const { guild } = message;

        // Evaluate initial conditions.
        if (args.length <= 2) {
            roleAction
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'Esta acción requiere mencionar al usuario y nombrar el rol.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}giverole <@miembro> <@rol/rol>\``)
            message.reply({ embeds: [roleAction], files: [errorImg] });
            return;
        }

        // Get user ID from tag
        const userID = args[1].replace(/[<@!&>]/g, '');
        let member = guild!.members.cache.get(userID);

        // Get role ID from tag.
        const roleID = args[2].replace(/[<@!&>]/g, '');
        let role = guild!.roles.cache.get(roleID);

        if (!role) { // In case Role's name is typed instead of a mention.
            role = message.guild!.roles.cache.find(role => role.name.toLowerCase().includes(args[2]))!;
        }
        if (!member || !role) { // Checks if either the role or the user does not exist.
            roleAction
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'El rol o usuario no existe. Intenta mencionarlos.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [roleAction], files: [errorImg] });
            return;
        }

        // Checks if the user's role has enought rank to give the same role. (In case a user is trying to give his highest ranked role)
        if (message.member!.roles.highest <= role && message.member!.id !== guild!.ownerId) {
            roleAction
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'El rol está bloqueado porque es un rango más alto que tu rol más alto.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [roleAction], files: [errorImg] });
            return;
        }

        // Attempt to give the role.
        member.roles.add(role.id).then(() => {
            roleAction
                .setColor(config.embeds.colors.successColor as ColorResolvable)
                .setAuthor({ name: 'Rol agregado exitosamente.', iconURL: 'attachment://success-icon.png' })
            message.channel.send({ embeds: [roleAction], files: [successImg] })
        }).catch(() => {
            roleAction
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tengo suficientes permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
            message.channel.send({ embeds: [roleAction], files: [errorImg] })
        });
    },

    executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        const roleAction = new EmbedBuilder();

        const guild = interaction.guild;
        const user = interaction.options.getUser('user', true);
        const role = interaction.options.getRole('role', true);

        // Checks if the user's role has enought rank to give the same role. (In case a user is trying to give his highest ranked role)
        const interationmember = guild!.members.cache.get(interaction.member!.user.id)!;
        const member = guild!.members.cache.get(user.id)!;

        if (interationmember.roles.highest <= role && interaction.member!.user.id !== guild!.ownerId) {
            roleAction
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'El rol está bloqueado porque es un rango más alto que tu rol más alto.', iconURL: 'attachment://error-icon.png' })
            interaction.reply({ embeds: [roleAction], files: [errorImg] });
            return;
        }

        // Attempt to give the role.
        member.roles.add(role.id).then(() => {
            roleAction
                .setColor(config.embeds.colors.successColor as ColorResolvable)
                .setAuthor({ name: 'Rol agregado exitosamente.', iconURL: 'attachment://success-icon.png' })
            interaction.reply({ embeds: [roleAction], files: [successImg] })
        }).catch(() => {
            roleAction
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tengo suficientes permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
            interaction.reply({ embeds: [roleAction], files: [errorImg] })
        });
    }
} as MCommand