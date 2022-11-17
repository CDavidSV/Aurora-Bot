// Kicks a guild member.
import config from '../../config.json';
import { Client, Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField, SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import MCommand from '../../Classes/MCommand';

// Kick reason.
let kickReason = 'No especificada';
// error and success images.
const errorImg = new AttachmentBuilder(config.embeds.images.errorImg);

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a guild member.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
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
    aliases: ['kick'],
    category: 'Moderación',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.KickMembers],
    userPerms: [PermissionsBitField.Flags.KickMembers],
    cooldown: 0,
    commandType: 'Slash&Prefix',

    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        // Create message embed.
        const kickEmbed = new EmbedBuilder();

        // Convert args to lowercase.
        args = args.map(arg => arg.toLowerCase());
        // Get guild 
        const { guild } = message;

        // In case the no member is mentioned.
        if (args.length < 2) {
            kickEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'Debes de mencionar al miembro.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando \`${prefix}kick <@miembro> (razón opcional)\``)
            message.reply({ embeds: [kickEmbed], files: [errorImg] });
            return;
        }

        // No reason specified.
        if (args.length > 2) {
            kickReason = String(args.slice(2)).replace(/,/g, ' ');
        }

        // Get member object.
        const userID = args[1].replace(/[<@!&>]/g, '');
        const member = guild!.members.cache.get(userID);

        // member does not exist
        if (!member) {
            kickEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'Ese miembro no existe.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [kickEmbed], files: [errorImg] });
            return;
        }

        // Avoids user from banning moderators and administrators.
        if ((member!.permissions.has([PermissionsBitField.Flags.Administrator]) || !member!.kickable) && message.member!.id !== guild!.ownerId) {
            kickEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedes expulsar a un administrador.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [kickEmbed], files: [errorImg] });
            return;
        }

        message.delete();
        // Attempts to kick the mentioned user.
        member!.kick(kickReason).then(() => {
            kickEmbed
                .setColor(config.embeds.colors.defaultColor as ColorResolvable)
                .setAuthor({ name: `${member!.user.tag} fue expulsad@ del servidor.`, iconURL: String(member!.user.avatarURL()) })
                .setDescription(`****Razón:**** ${kickReason}`)
            message.channel.send({ embeds: [kickEmbed] });
        }).catch(() => {
            kickEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedo hacer eso porque mi rol más alto está demasiado bajo en la jerarquía.', iconURL: 'attachment://error-icon.png' })
            message.channel.send({ embeds: [kickEmbed], files: [errorImg] });
        });
    },

    async executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        // Create message embed.
        const kickEmbed = new EmbedBuilder();

        const guild = interaction.guild;
        const user = interaction.options.getUser('user', true);
        const member = guild!.members.cache.get(user.id)!;

        // Avoids user from banning moderators and administrators.
        if ((member!.permissions.has([PermissionsBitField.Flags.Administrator]) || !member!.kickable) && interaction.member!.user.id !== guild!.ownerId) {
            kickEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedes expulsar a un administrador.', iconURL: 'attachment://error-icon.png' })
            interaction.reply({ embeds: [kickEmbed], files: [errorImg] });
            return;
        }

        kickReason = interaction.options.getString('reason', true);

        member!.kick(kickReason).then(() => {
            kickEmbed
                .setColor(config.embeds.colors.defaultColor as ColorResolvable)
                .setAuthor({ name: `${member!.user.tag} fue expulsad@ del servidor.`, iconURL: String(member!.user.avatarURL()) })
                .setDescription(`****Razón:**** ${kickReason}`)
            interaction.reply({ embeds: [kickEmbed] });
        }).catch(() => {
            kickEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedo hacer eso porque mi rol más alto está demasiado bajo en la jerarquía.', iconURL: 'attachment://error-icon.png' })
            interaction.reply({ embeds: [kickEmbed], files: [errorImg] });
        });
    }
} as MCommand