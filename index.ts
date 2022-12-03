// Index.ts : This file runs the bot. Program execution begins and ends there.
// Copyright © 2022-2022 Viper#9020. All rights reserved. 
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import commandHandler from './handlers/command-handler';
import eventHandler from './handlers/event-handler';
import MCommand from './Classes/MCommand';
//import KitagawaPlayer from './player/KitagawaPlayer';
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

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, MCommand>;
        //serverQueues: Collection<string, KitagawaPlayer>;
    }
}

// Declare commands collections.
client.commands = new Collection<string, MCommand>();

// Declare serverqueues collection to store music data per guild.
//client.serverQueues = new Collection<string, KitagawaPlayer>();

// -------------------------------------------------------
// ------------------- COMMAND HANDLER -------------------
// -------------------------------------------------------
commandHandler.getCommands();

// -------------------------------------------------------
// -------------------- EVENT HANDLER --------------------
// -------------------------------------------------------
eventHandler.getEvents();

// Token.
client.login(process.env.TOKEN);

export { client };