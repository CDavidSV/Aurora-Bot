import { Client, Collection, GatewayIntentBits, SlashCommandBuilder } from "discord.js";
import setupEvents from "./handlers/event-handler";
import colors from 'colors';
import dotenv from "dotenv"
import setupCommands from "./handlers/slash-command-handler";

dotenv.config();
colors.enable();

// Ambient modules.
declare module "discord.js" {
    export interface Client {
        commands: Collection<string, any>;
        slashCommands: Collection<string, SlashCommandBuilder>;
        startTime: number;
    }
}

// Variables
const token: string = process.env.TOKEN as string;

// Bot Setup.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
setupEvents(client);
setupCommands(client, token);

client.login(token);

export default client;