import { Client, REST, Routes } from "discord.js";
import getFiles from "../util/get-files";
import config from "../config.json";

interface CommandHandlerOptions {
    updateCommands?: boolean,
    updateType?: UpdateType
}

enum UpdateType {
    DEV = 'dev',
    PROD = 'prod'
}

const setupCommands = (token: string, client: Client, clientId: string, options: CommandHandlerOptions = {}) => {
    const {
        updateCommands = true,
        updateType = UpdateType.DEV
    } = options

    // Get all Commands and determine the type.
    getFiles('./commands/slash', '.ts', 'SLASH COMMANDS').forEach((commandFile) => {
        const command = require(`${commandFile}`).default;
        if (!command) return;

        if (command.subCommand) {
            return client.subCommands.set(command.subCommand, command);
        }

        client.slashCommands.set(command.data.name, command);
    });

    if (!updateCommands) return console.log('Commands not updated'.red);

    const rest = new REST().setToken(token);
    (async () => {
        if (updateType === UpdateType.DEV) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, config.testGuildId),
                { body: Array.from(client.slashCommands.values()).map((command) => {
                    return command.data.toJSON();
                })} // Convert slash command data into json.
            )        
            .then(() => console.log(`Successfully reloaded development application (/) commands.`.green))
            .catch((e => console.error(e)));

            return;
        }

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: Array.from(client.slashCommands.values()).map((command) => {
                return command.data.toJSON();
            })}
        )
        .then(() => console.log(`Successfully reloaded application (/) commands.`.green))
        .catch((e => console.error('Unable to reload application commands'.red, e)));
    })();
}

export { setupCommands, CommandHandlerOptions, UpdateType };