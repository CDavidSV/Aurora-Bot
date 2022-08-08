// Index.ts : This file runs the bot. Program execution begins and ends there.
// Copyright © 2022-2022 Viper#9020. All rights reserved. 

import DiscordJS, { Client, Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, ActivityType, ChannelType } from 'discord.js';
import dotenv from 'dotenv';
import getFiles from './handlers/get-files';
import config from './config.json';
import mongo from './mongoDB/mongo';
const prefixScheema = require('./mongoDB/schemas/prefix-scheema');
dotenv.config();

// Create client and add intents.
const client = new DiscordJS.Client({
    intents: [
        DiscordJS.GatewayIntentBits.Guilds,
        DiscordJS.GatewayIntentBits.GuildMessages,
        DiscordJS.GatewayIntentBits.MessageContent,
        DiscordJS.GatewayIntentBits.GuildVoiceStates
    ]
});

// All server prefixes.
let guildPrefixes: any = {};

// On bot ready.
client.on('ready', async (bot: Client) => {
    console.log(`Successfully logged in as ${bot.user!.tag}`);

    bot.user!.setActivity('ma!help', { type: ActivityType.Listening });
    // Connect to mongo.
    await mongo().then(async (mongoose) => {
        try {
            for (const guild of client.guilds.cache) {
                const guildId = guild[1].id;
                const result = await prefixScheema.findOne({ _id: guildId });
                if (!result) continue;
                guildPrefixes[guildId] = result.prefix;
            }
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
const commands: { aliases: string[], execute: any }[] = []

// Default prefix for commands (Always use this).
const globalPrefix = config.globalPrefix;

// Ending suffix for file type.
const suffix = '.ts';

// Get all directories for each command.
const commandFiles = getFiles('./commands', suffix);

// Error image.
const file = new AttachmentBuilder(config.embeds.errorImg);

// Loop through all commmands in the commandsFile array and add them to the commands object. 
for (const command of commandFiles) {
    let commandFile = require(command);
    if (commandFile.default) commandFile = commandFile.default;

    commands[commandFiles.indexOf(command)] = commandFile;
}

// Normal commands with prefix.
client.on('messageCreate', async (message: Message)  => {
    // Get guild prefix.
    if (!guildPrefixes[message.guild!.id]) {
        await mongo().then( async (mongoose) => {
            try {
                const result = await prefixScheema.findOne({ _id: message.guild!.id });
                if (result) {
                    guildPrefixes[message.guild!.id] = result.prefix;
                } else {
                    guildPrefixes[message.guild!.id] = globalPrefix;
                }
            } finally {
                mongoose.connection.close();
            }
        })
    }
    let prefix = guildPrefixes[message.guild!.id];
    if (message.content.startsWith(globalPrefix)) {
        prefix = globalPrefix
    }
    if(!message.content.startsWith(prefix) || message.author.bot || message.channel.type === ChannelType.DM) {
        return;
    }

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
            .setColor(config.embeds.errorColor as ColorResolvable)
            .setAuthor({ name: 'Error Inesperado.', iconURL: 'attachment://error-icon.png' })
        message.reply({ embeds: [unexpectedError], files: [file] });
        console.log(error);
    }

})

// -------------------------------------------------------
// ---------------- SLASH COMMAND HANDLER ----------------
// -------------------------------------------------------

// Token.
client.login(process.env.TOKEN);

