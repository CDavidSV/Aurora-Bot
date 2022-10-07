import { client } from '../index';
import { Message, ChannelType, ColorResolvable, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import config from '../config.json';
import prefixHandler from '../handlers/prefix-handler';
// Normal commands with prefix.
const globalPrefixes = config.globalPrefixes;

// Error image.
const file = new AttachmentBuilder(config.embeds.images.errorImg);

client.on('messageCreate', async (message: Message) => {
    if (message.author.bot || message.channel.type === ChannelType.DM) return;

    // Get all guild prefixes.
    let guildPrefixes: any = prefixHandler.getGuildPrefixes();

    let prefix: string | undefined;
    for (let globalPrefix of globalPrefixes) {
        if (message.content.startsWith(globalPrefix)) {
            prefix = globalPrefix;
            break;
        } else {
            prefix = guildPrefixes[message.guild!.id];
        }
    }
    if (!prefix || !message.content.startsWith(prefix)) return;

    // Rmoves prefix and converts the message into lowercase.
    const sliceParameter = prefix.length;

    const args = message.content.slice(sliceParameter).split(" ").filter((element: String) => element != '');
    const commandName = args.slice().shift()!.toLowerCase();

    const command = client.commands.find(c => c.aliases.includes(commandName));

    // No such command name found or is only of slash command type.
    if (!command) return;

    if (!message.member!.permissions.has(command.userPerms)) {
        const noPermissions = new EmbedBuilder()
            .setColor(config.embeds.colors.errorColor as ColorResolvable)
            .setAuthor({ name: 'No tienes suficientes permisos para usar este comando.', iconURL: 'attachment://error-icon.png' })
        message.reply({ embeds: [noPermissions], files: [file], allowedMentions: { repliedUser: false } });
        return;
    }

    if (!message.guild!.members.me!.permissions.has(command.botPerms)) {
        const noPermissions = new EmbedBuilder()
            .setColor(config.embeds.colors.errorColor as ColorResolvable)
            .setAuthor({ name: 'No tengo suficiente permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
            .addFields({ name: 'Permisos requeridos', value: command.botPerms.toString() })
        message.reply({ embeds: [noPermissions], files: [file] });
        return;
    }

    // Execute Commands.
    try {
        command.execute(client, message, prefix, null, ...args); // Executes command.
    } catch (error) {
        const unexpectedError = new EmbedBuilder()
            .setColor(config.embeds.colors.errorColor as ColorResolvable)
            .setAuthor({ name: 'Error Inesperado.', iconURL: 'attachment://error-icon.png' })
        message.reply({ embeds: [unexpectedError], files: [file] });
    }
})