// Index.ts : This file runs the bot. Program execution begins and ends there.
// Copyright © 2022-2022 Viper#9020. All rights reserved. 

import DiscordJS, { Intents, MessageEmbed, MessageAttachment, ColorResolvable } from 'discord.js';
import dotenv from 'dotenv';
import getFiles from './get-files';
import config from './config.json';
import mongo from './mongo';
import update from './update';
dotenv.config();

// Create client and add intents.
const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

// All server prefixes.
let guildPrefixes: any = {};

// On bot ready.
client.on('ready', async (bot) => {
    console.log(`Successfully logged in as ${bot.user.tag}`);

    // Connect to mongo.
    bot.user.setActivity('ma!help', { type: "LISTENING" });
    await mongo().then(mongoose => {
        try {
            console.log('Successfully connected to mongo');
        } finally {
            mongoose.connection.close();
        }
    });

});

// -------------------------------------------------------
// ------------------- COMMAND HANDLER -------------------
// -------------------------------------------------------

// Create command object (all executable commands).
const commands: { [key: string]: any } = {}

// Default prefix for commands (Always use this).
const globalPrefix = config.globalPrefix;

// Ending suffix for file type.
const suffix = '.ts';

// Get all directories for each command.
const commandFiles = getFiles('./commands', suffix);

// Error image.
const file = new MessageAttachment(config.embeds.errorImg);

// Loop through all commmands in the commandsFile array and add them to the commands object. 
for (const command of commandFiles) {
    let commandFile = require(command);
    if (commandFile.default) commandFile = commandFile.default;

    // Gets command name from directory file.
    const split = command.replace(/\\/g, '/').split('/');
    const commandName = split[split.length - 1].replace(suffix, '');

    commands[commandName.toLowerCase()] = commandFile;
}

// Normal commands with prefix.
client.on('messageCreate', async message => {
    // Load al server prefixes.
    guildPrefixes = await update.updateGuildPrefixes(client);

    // Prefix
    let prefix = globalPrefix;
    if (message.content.startsWith(guildPrefixes[message.guild!.id])) {
        prefix = guildPrefixes[message.guild!.id]
    }

    // Verify that the message author is not the bot and that it has the correct prefix
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    // Rmoves prefix and converts the message into lowercase.
    const sliceParameter = prefix.length;

    const args = message.content.slice(sliceParameter).toLowerCase().split(" ").filter(element => element != '');
    const commandName = args.slice().shift()!;

    // No such command name found.
    if (!commands[commandName]) return;

    // Execute Commands.
    try {
        commands[commandName].execute(client, message, prefix, ...args); // Executes command.
    } catch (error) { // On Error (Avoids Entire bot from crashing).
        const unexpectedError = new MessageEmbed()
            .setColor(config.embeds.errorColor as ColorResolvable)
            .setAuthor({ name: 'Error Inesperado.', iconURL: 'attachment://error-icon.png' })
        message.reply({ embeds: [unexpectedError], files: [file] });
    }
})

// Token.
client.login(process.env.TOKEN);

