import { Client, Collection, GatewayIntentBits } from "discord.js";
import colors from 'colors';
import dotenv from "dotenv"
import setupEvents from "./handlers/event-handler";
import setupCommands from "./handlers/command-handler";
import setupButtons from "./handlers/component-handler";
import setupModals from "./handlers/modal-handler";
import mongoose from "mongoose";
import tempvcScheema from "./scheemas/tempvcScheema";
import tempvcGeneratorsScheema from "./scheemas/tempvcGeneratorsScheema";
import config from "./config.json";
import { ACommand } from "./structs/ACommand";

dotenv.config();
colors.enable();

// Ambient modules.
declare module "discord.js" {
    export interface Client {
        legacyCommands: Collection<string, ACommand>;
        slashCommands: Collection<string, any>;
        subCommands: Collection<string, any>;
        messageComponents: Collection<string, any>;
        modals: Collection<string, any>;
        cooldowns: Collection<string, Collection<string, number>>;
        tempvcGenerators: Set<string>;
        tempvChannels: Set<string>;
        startTime: number;
    }
}

// Tokens.
const token: string = process.env.TOKEN as string;
// const token: string = process.env.TOKEN_TEST as string; // For testing only.

// Client id
const clientId = config.clientId;
// const clientId = config.testClientId; // For testing only.

// Bot Setup.
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
});

async function main() {
    // Initialize sets and collections.
    client.tempvChannels = new Set();
    client.tempvcGenerators = new Set();
    client.messageComponents = new Collection();
    client.modals = new Collection();
    client.slashCommands = new Collection();
    client.subCommands = new Collection();
    client.cooldowns = new Collection();

    setupEvents(client);
    setupButtons(client);
    setupModals(client);
    setupCommands(token, client, clientId);

    // Connect to mongo
    await mongoose.connect(process.env.MONGO_URI!).then(() => { // Connect to mongo, url needs to be provided in a .env file.
        console.log('Connected to mongo'.green);

        // Get temp vc generators and voice channels.
        tempvcGeneratorsScheema.find().then((generators) => {
            if (generators.length >= 1) {
                generators.forEach((generator) => {
                    client.tempvcGenerators.add(generator.guild_id + generator.generator_id);
                });
            }
        });
        tempvcScheema.find().then((voiceChannels) => {
            if (voiceChannels.length >= 1) {
                voiceChannels.forEach((voiceChannel) => {
                    client.tempvChannels.add(voiceChannel.guild_id + voiceChannel.vc_id);
                });
            }
        });
    });

    client.login(token);
}

main();