import { Client, REST, Routes } from "discord.js";
import getFiles from "../util/get-files";
import config from "../config.json";

const setupCommands = (client: Client, token: string) => {
    // Get all Commands and determine the type.
    getFiles('./commands/slash', '.ts', 'SLASH COMMANDS').forEach((commandFile) => {
        const command = require(`${commandFile}`).default;
        if (!command || !command.data) return;

        client.commands.set(command.data.name, command);
    });

    const rest = new REST().setToken(token);
    (async () => {
        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.testGuildId),
            { body: Array.from(client.commands.values()).map((command) => {
                return command.data.toJSON();
            })} // Convert slash command data into json.,
        )
        .then(() => console.log(`Successfully reloaded application (/) commands.`.green))
        .catch((e => console.error(e)));
    })();
}

export default setupCommands;