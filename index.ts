// Index.ts : This file runs the bot. Program execution begins and ends there.
// Copyright © 2022-2022 Viper#9020. All rights reserved. 

import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import dotenv from 'dotenv';
import commandHandler from './handlers/command-handler';
import eventHandler from './handlers/event-handler';
import mongo from './mongoDB/mongo';
dotenv.config();

// Create client and add intents.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

let commands: { aliases: string[], execute: any }[];
let events;

// -------------------------------------------------------
// -------------------- EVENT HANDLER --------------------
// -------------------------------------------------------
events = eventHandler.getEvents();

// -------------------------------------------------------
// ------------------- COMMAND HANDLER -------------------
// -------------------------------------------------------
commands = commandHandler.getCommands();

// -------------------------------------------------------
// ---------------- SLASH COMMAND HANDLER ----------------
// -------------------------------------------------------
// Working on it still...

// Token.
client.login(process.env.TOKEN);

export { client, commands };

