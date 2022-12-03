import { REST, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';
import dotenv from 'dotenv';
import MCommand, { InputOption } from '../Classes/MCommand';
import { clientId, testGuildId } from '../config.json';
import getFiles from './get-files';
dotenv.config();

function addInputOptions(commandBuilder: SlashCommandSubcommandBuilder, inputOptions: InputOption[]): SlashCommandSubcommandBuilder {
    if (inputOptions.length < 1) {
        return commandBuilder;
    }

    for (let i of inputOptions) {
        switch (i.type) {
            case 'Attachment':
                commandBuilder.addAttachmentOption(subCommand =>
                    subCommand.setName(i.name));
                break;
            case 'Boolean':
                commandBuilder.addBooleanOption(subCommand =>
                    subCommand.setName(i.name));
                break;
            case 'Channel':
                commandBuilder.addChannelOption(subCommand =>
                    subCommand.setName(i.name));
                break;
            case 'Integer':
                commandBuilder.addIntegerOption(subCommand =>
                    subCommand.setName(i.name));
                break;
            case 'Mentionable':
                commandBuilder.addMentionableOption(subCommand =>
                    subCommand.setName(i.name));
                break;
            case 'Number':
                commandBuilder.addNumberOption(subCommand =>
                    subCommand.setName(i.name));
                break;
            case 'Role':
                commandBuilder.addRoleOption(subCommand =>
                    subCommand.setName(i.name));
                break;
            case 'String':
                commandBuilder.addStringOption(subCommand =>
                    subCommand.setName(i.name));
                break;
            case 'User':
                commandBuilder.addUserOption(subCommand =>
                    subCommand.setName(i.name));
                break;
        }
    }

    return commandBuilder;
}

function createSubCommandGroup() {
    return;
}

function creatSubCommand() {
    return;
}

export default {
    async getSlashCommands() {
        // Create command object (all executable commands).
        const slashCommands: Map<string, SlashCommandBuilder> = new Map();

        // Ending suffix for file type.
        const suffix = '.ts';

        // Get all directories for each command.
        const commandFiles = getFiles('./commands', suffix, 'SLASH COMMAND', false);

        // Loop through all commmands in the commandsFile array and add them to the commands object. 
        for (const command of commandFiles) {
            let file = require(`.${command}`);
            if (file.default) file = file.default;
            const commandFile: MCommand = file;

            if (commandFile.commandType == 'Prefix') continue;
            if (commandFile.slashCategory && commandFile.slashCategory.toLowerCase() === commandFile.name.toLowerCase()) {
                throw 'Command name and slash category cannot be the same.';
            }
            if (slashCommands.get(commandFile.name.toLowerCase())) {
                throw 'Command name already exists as a slash category or other command.';
            }

            if (commandFile.slashCategory && slashCommands.get(commandFile.slashCategory.toLowerCase())) { // Modifies a command builder.
                let data = slashCommands.get(commandFile.slashCategory.toLowerCase())!;
                if (commandFile.subOptions.length > 0) {
                    let newData: SlashCommandSubcommandGroupBuilder = new SlashCommandSubcommandGroupBuilder()
                        .setName(commandFile.name)
                        .setDescription(commandFile.description)

                    for (let subOption of commandFile.subOptions) {
                        let subCommand = new SlashCommandSubcommandBuilder()
                            .setName(subOption.name)
                            .setDescription(subOption.description);

                        subCommand = addInputOptions(subCommand, subOption.inputOptions) as SlashCommandSubcommandBuilder;
                        newData.addSubcommand(subCommand);
                    }
                    data.addSubcommandGroup(newData);
                } else {
                    let subCommand = new SlashCommandSubcommandBuilder()
                        .setName(commandFile.name)
                        .setDescription(commandFile.description);
                    subCommand = addInputOptions(subCommand, commandFile.inputOptions) as SlashCommandSubcommandBuilder;
                    data!.addSubcommand(subCommand);
                }
                slashCommands.set(commandFile.name, data);
            } else { // Creates a new command.
                const data: SlashCommandBuilder = new SlashCommandBuilder();
                let name: string;

                if (commandFile.slashCategory !== null && commandFile.subOptions.length > 0) {
                    data.setName(commandFile.slashCategory);
                    name = commandFile.slashCategory;
                    // Add subcommand group.
                    for (let subOption of commandFile.subOptions) {

                    }
                } else if (commandFile.slashCategory == null && commandFile.subOptions.length > 0) {
                    data.setName(commandFile.name);
                    name = commandFile.name;
                    // Add subcommands.
                    for (let subOption of commandFile.subOptions) {

                    }
                } else {
                    name = commandFile.name;
                    data.setName(commandFile.name)
                        .setDescription(commandFile.description);
                }
                slashCommands.set(commandFile.name, data);
            }
        }

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string);

        let slashCommandsArr = [];
        for (let command of slashCommands) {
            slashCommandsArr.push(command[1]);
        }

        await rest.put(Routes.applicationGuildCommands(clientId, testGuildId), { body: slashCommandsArr })
            .then((data: any) => console.log(`Successfully registered ${data.length} application commands`))
            .catch(console.error);
    }
}