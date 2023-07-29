import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import setupEvents from "./handlers/event-handler";
import colors from 'colors';
import dotenv from "dotenv"
import setupCommands from "./handlers/command-handler";
import setupButtons from "./handlers/component-handler";
import { ACommand } from "./structs/ACommand";

dotenv.config();
colors.enable();

// Ambient modules.
declare module "discord.js" {
    export interface Client {
        legacyCommands: Collection<string, ACommand>;
        slashCommands: Collection<string, any>;
        subCommands: Collection<string, any>;
        messageComponents: Collection<string, any>
        cooldowns: Collection<string, Collection<string, number>>;
        tempvcGenerators: Set<string>;
        tempvChannels: Set<string>;
        startTime: number;
    }
}

// Tokens.
// const token: string = process.env.TOKEN as string;
const token: string = process.env.TOKEN_TEST as string;

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

// Initialize sets and collections.
client.tempvChannels = new Set();
client.tempvcGenerators = new Set();
client.messageComponents = new Collection();
client.slashCommands = new Collection();
client.subCommands = new Collection();

setupEvents(client);
setupButtons(client);
setupCommands(token, client);

client.login(token);

export { client };