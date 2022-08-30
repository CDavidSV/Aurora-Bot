import { client, commands } from '../index';
import { Message, ChannelType, ColorResolvable, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import config from '../config.json';
import prefixHandler from '../handlers/prefix-handler';
// Normal commands with prefix.
const globalPrefix = config.globalPrefix;

// Error image.
const file = new AttachmentBuilder(config.embeds.images.errorImg);

client.on('messageCreate', async (message: Message) => {
    // Get all guild prefixes.
    let guildPrefixes: any = prefixHandler.getGuildPrefixes();
    if (message.author.bot || message.channel.type === ChannelType.DM) return;
    let prefix = guildPrefixes[message.guild!.id];
    if (message.content.startsWith(globalPrefix)) {
        prefix = globalPrefix
    }
    if (!message.content.startsWith(prefix)) return;

    // Rmoves prefix and converts the message into lowercase.
    const sliceParameter = prefix.length;

    const args = message.content.slice(sliceParameter).split(" ").filter((element: String) => element != '');
    const commandName = args.slice().shift()!.toLowerCase();

    const command = commands.find(c => c.aliases && c.aliases.includes(commandName));

    // No such command name found.
    if (!command) return;

    // Execute Commands.
    try {
        command.execute(client, message, prefix, ...args); // Executes command.
    } catch (error) { // On Error (Avoids Entire bot from crashing).
        const unexpectedError = new EmbedBuilder()
            .setColor(config.embeds.colors.errorColor as ColorResolvable)
            .setAuthor({ name: 'Error Inesperado.', iconURL: 'attachment://error-icon.png' })
        message.reply({ embeds: [unexpectedError], files: [file] });
        console.log(error);
    }
})