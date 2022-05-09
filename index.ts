import DiscordJS, { Intents, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv';
import getFiles from './get-files';
dotenv.config();

// Create client and add intents.
const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

client.on('ready', bot => {
    console.log(`Successfully logged in as ${bot.user.tag}`);
});

// COMMAND HANDLER

// Create command object (stres all executable commands).
const commands: {[key: string]: any} = {}

// Prefix for commands
let prefix = '-';

// Ending suffix for file type.
const suffix = '.ts';

// Get all directories for each command.
const commandFiles = getFiles('./commands', suffix);

// Loop through all commmands in the commandsFile array and add them to the commands object. 
for (const command  of commandFiles) {
    let commandFile = require(command);
    if (commandFile.default) commandFile = commandFile.default;

    const split = command.replace(/\\/g, '/').split('/');
    const commandName = split[split.length - 1].replace(suffix, '');

    commands[commandName.toLowerCase()] = commandFile;
}

console.log(commands);

// Normal commands with prefix.
client.on('messageCreate', message => {
    // Verify that the message author is not the bot and that it has the correct prefix
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    // Rmoves prefix and converts the message into lowercase.
    const args = message.content.slice(prefix.length).toLowerCase().split(" ").filter(element => element != '');
    const commandName = args.shift()!;

    if (!commands[commandName]) return;

    // Commands.
    try {
        commands[commandName].execute(client, message);
    } catch (error) {
        const noCommandEmbed = new MessageEmbed()
        .setColor('#FF0000')
        .setDescription('Error: No hay tal comando.')
    message.reply({ embeds: [noCommandEmbed] });
    }
})

// Token.
client.login(process.env.TOKEN);