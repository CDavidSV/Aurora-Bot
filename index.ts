import DiscordJS, { Intents, MessageEmbed, MessageAttachment } from 'discord.js';
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

// On bot ready.
client.on('ready', bot => {
    console.log(`Successfully logged in as ${bot.user.tag}`);
});

// -------------------------------------------------------
// ------------------- COMMAND HANDLER -------------------
// -------------------------------------------------------

// Create command object (all executable commands).
const commands: {[key: string]: any} = {}

// Prefix for commands
let prefix = '-';
const defaultPrefix = 'ma!';

// Ending suffix for file type.
const suffix = '.ts';

// Get all directories for each command.
const commandFiles = getFiles('./commands', suffix);

// Error image.
const file = new MessageAttachment('./assets/command-images/error-icon.png');

// Loop through all commmands in the commandsFile array and add them to the commands object. 
for (const command  of commandFiles) {
    let commandFile = require(command);
    if (commandFile.default) commandFile = commandFile.default;

    // Gets command name from directory file.
    const split = command.replace(/\\/g, '/').split('/');
    const commandName = split[split.length - 1].replace(suffix, '');

    commands[commandName.toLowerCase()] = commandFile;
}

// Display command object.
console.log(commands);

// Normal commands with prefix.
client.on('messageCreate', message => {
    // Verify that the message author is not the bot and that it has the correct prefix
    if (message.author.bot || !message.content.startsWith(prefix) && !message.content.startsWith(defaultPrefix)) return;

    // Rmoves prefix and converts the message into lowercase.
    let sliceParameter;
    if (message.content.startsWith(prefix)) {
        sliceParameter = prefix.length;
    } else {
        sliceParameter = defaultPrefix.length;
    }
    
    const args = message.content.slice(sliceParameter).toLowerCase().split(" ").filter(element => element != '');
    const commandName = args.slice().shift()!;

    // No such command name found.
    if (!commands[commandName]) return; 
    
    // Commands.
    try {
        commands[commandName].execute(client, message, prefix, ...args); // Executes command.
    } catch (error) { // On Error (Avoids Entire bot from crashing).
        const unexpectedError = new MessageEmbed()
            .setColor('#c9040e')
            .setAuthor({ name: 'Error Inesperado.', iconURL: 'attachment://error-icon.png' })
        message.reply({ embeds: [unexpectedError], files: [file] });
    }        

})

// Token.
client.login(process.env.TOKEN);