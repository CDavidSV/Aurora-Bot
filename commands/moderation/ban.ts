// Bans a guild member.
import config from '../../config.json';
import { Client, Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField, User, SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import MCommand from '../../Classes/MCommand';

// error image.
const errorImg = new AttachmentBuilder(config.embeds.images.errorImg);
// Ban reason.
let banReason = 'No especificada';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a guild member.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User Mention')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
                .setMaxLength(256))
        .setDMPermission(false),
    aliases: ['ban'],
    category: 'Moderación',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.BanMembers],
    userPerms: [PermissionsBitField.Flags.BanMembers],
    cooldown: 0,
    commandType: 'Slash&Prefix',

    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        // Create message embed.
        const banEmbed = new EmbedBuilder();

        // Convert args to lowercase.
        args = args.map(arg => arg.toLowerCase());
        // Get guild 
        const { guild } = message;

        // In case the no member is mentioned.
        if (args.length < 2) {
            banEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'Debes de mencionar al miembro.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}ban <@miembro> (razón opcional)\``)
            message.reply({ embeds: [banEmbed], files: [errorImg] });
            return;
        }

        // No reason specified.
        if (args.length > 2) {
            banReason = String(args.slice(2)).replace(/,/g, ' ');
        }

        // Get member object.
        const userID = args[1].replace(/[<@!&>]/g, '');
        const member = guild!.members.cache.get(userID);
        let user: User;

        // member does not exist.
        if (!member) {
            try {
                user = await client.users.fetch(userID);
            } catch {
                banEmbed
                    .setColor(config.embeds.colors.errorColor as ColorResolvable)
                    .setAuthor({ name: 'Ese usuario no existe.', iconURL: 'attachment://error-icon.png' })
                message.reply({ embeds: [banEmbed], files: [errorImg] });
                return;
            }
        } else {
            // Avoids user from banning moderators and administrators.
            user = member!.user;
            if ((member!.permissions.has([PermissionsBitField.Flags.Administrator]) || !member!.bannable) && message.member!.id !== guild!.ownerId) {
                banEmbed
                    .setColor(config.embeds.colors.errorColor as ColorResolvable)
                    .setAuthor({ name: 'No puedes banear a un administrador.', iconURL: 'attachment://error-icon.png' })
                message.reply({ embeds: [banEmbed], files: [errorImg] });
                return;
            }
        }

        message.delete();

        // Attempts to ban the mentioned member.
        message.guild!.members.ban(user, { reason: banReason }).then(() => {
            banEmbed
                .setColor(config.embeds.colors.defaultColor as ColorResolvable)
                .setAuthor({ name: `${user.tag} fue banead@ del servidor.`, iconURL: String(user.avatarURL({ forceStatic: false })) })
                .setDescription(`****Razón:**** ${banReason}`)
            message.channel.send({ embeds: [banEmbed] });
        }).catch(() => {
            banEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedo hacer eso porque mi rol más alto está demasiado bajo en la jerarquía.', iconURL: 'attachment://error-icon.png' })
            message.channel.send({ embeds: [banEmbed], files: [errorImg] });
        });
    },

    async executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        // Create message embed.
        const banEmbed = new EmbedBuilder();

        const guild = interaction.guild;
        const user = interaction.options.getUser('user', true);
        const member = guild!.members.cache.get(user.id)!;

        // Avoids user from banning moderators and administrators.
        if ((member!.permissions.has([PermissionsBitField.Flags.Administrator]) || !member!.bannable) && interaction.member!.user.id !== guild!.ownerId) {
            banEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedes banear a un administrador.', iconURL: 'attachment://error-icon.png' })
            interaction.reply({ embeds: [banEmbed], files: [errorImg] });
            return;
        }

        banReason = interaction.options.getString('reason', true);

        // Attempts to ban the mentioned member.
        interaction.guild!.members.ban(user, { reason: banReason }).then(() => {
            banEmbed
                .setColor(config.embeds.colors.defaultColor as ColorResolvable)
                .setAuthor({ name: `${user.tag} fue banead@ del servidor.`, iconURL: String(user.avatarURL({ forceStatic: false })) })
                .setDescription(`****Razón:**** ${banReason}`)
            interaction.reply({ embeds: [banEmbed] });
        }).catch(() => {
            banEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedo hacer eso porque mi rol más alto está demasiado bajo en la jerarquía.', iconURL: 'attachment://error-icon.png' })
            interaction.reply({ embeds: [banEmbed], files: [errorImg] });
        });
    }
} as MCommand