import { Client, Collection, GatewayIntentBits } from "discord.js";
import setupEvents from "./handlers/event-handler";
import colors from 'colors';
import dotenv from "dotenv"
import setupCommands from "./handlers/command-handler";

dotenv.config();
colors.enable();

// Ambient modules.
declare module "discord.js" {
    export interface Client {
        slashCommands: Collection<string, any>;
        subCommands: Collection<string, any>;
        startTime: number;
    }
}

// Variables
const token: string = process.env.TOKEN as string;

// Bot Setup.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.slashCommands = new Collection();
client.subCommands = new Collection();

setupEvents(client);
setupCommands(client, token);

client.login(token);

export default client;