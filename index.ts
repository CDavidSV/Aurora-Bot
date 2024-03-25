import { Client, Collection, GatewayIntentBits } from "discord.js";
import colors from 'colors';
import dotenv from "dotenv"
import setupEvents from "./handlers/event-handler";
import { UpdateType, setupCommands } from "./handlers/command-handler";
import setupButtons from "./handlers/component-handler";
import setupModals from "./handlers/modal-handler";
import mongoose from "mongoose";
import tempvcSchema from "./schemas/tempvcSchema";
import tempvcGeneratorsSchema from "./schemas/tempvcGeneratorsSchema";
import config from "./config.json";
import { ALegacyCommand } from "./models/ACommand";
import { ASlashCommand, ASlashSubCommand } from "./models/interfaces";

dotenv.config();
colors.enable();

// Ambient modules.
declare module "discord.js" {
    export interface Client {
        legacyCommands: Collection<string, ALegacyCommand>;
        slashCommands: Collection<string, ASlashCommand>;
        subCommands: Collection<string, ASlashSubCommand>;
        messageComponents: Collection<string, any>;
        modals: Collection<string, any>;
        cooldowns: Collection<string, Collection<string, { time: number, requests: number }>>;
        channelCooldowns: Collection<string, { requests: number, cooldown: number }>;
        tempvcGenerators: Set<string>;
        tempvChannels: Set<string>;
        startTime: number;
    }
}

// Bot Setup.
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions
    ]
});

const env = process.argv[2];
async function main(env: string = "prod") {
    // Tokens.
    let token: string;
    let clientId: string;
    switch (env) {
        case "prod":
            console.log('Starting bot in production mode'.magenta);
            token = process.env.TOKEN as string;
            clientId = config.clientId;
            break;
        case "dev":
            console.log('Starting bot in development mode'.yellow);
            token = process.env.TOKEN_TEST as string;
            clientId = config.testClientId;
            break;
        default:
            console.log('Invalid env variable provided. Starting in dev'.red);
            token = process.env.TOKEN_TEST as string;
            clientId = config.testClientId;
            break;
    }
    
    // Initialize sets and collections.
    client.tempvChannels = new Set();
    client.tempvcGenerators = new Set();
    client.messageComponents = new Collection();
    client.modals = new Collection();
    client.slashCommands = new Collection();
    client.subCommands = new Collection();
    client.cooldowns = new Collection();
    client.channelCooldowns = new Collection();

    setupEvents(client);
    setupButtons(client);
    setupModals(client);

    setupCommands(token, client, clientId, { updateCommands: true, updateType: env === "prod" ? UpdateType.PROD : UpdateType.DEV }); // Change to dev for testing new commands.

    // Connect to mongo
    await mongoose.connect(env === "prod" ? process.env.MONGO_URI! : process.env.MONGO_URI_TEST!).then(() => { // Connect to mongo, url needs to be provided in a .env file.
        console.log('Connected to mongo'.green);

        // Get temp vc generators and voice channels.
        tempvcGeneratorsSchema.find().then((generators) => {
            if (generators.length >= 1) {
                generators.forEach((generator) => {
                    client.tempvcGenerators.add(generator.guild_id + generator.generator_id);
                });
            }
        });
        tempvcSchema.find().then((voiceChannels) => {
            if (voiceChannels.length >= 1) {
                voiceChannels.forEach((voiceChannel) => {
                    client.tempvChannels.add(voiceChannel.guild_id + voiceChannel.vc_id);
                });
            }
        });
    });

    client.login(token);
}

main(env);