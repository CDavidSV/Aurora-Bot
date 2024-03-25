import { SlashCommandBuilder } from "discord.js";

interface ASlashCommand {
    data: SlashCommandBuilder;
    botPerms: bigint[];
    callback: Function;
    autoComplete?: Function;
    cooldown?: number;
    requestsBeforeCooldown?: number;
}

interface ASlashSubCommand {
    subCommand: string;
    callback: Function;
    autoComplete?: Function;
}

enum CommandOptionType {
    String = 'string',
    Integer = 'integer',
    Number = 'number',
    Role = 'role',  
    Attachment = 'attachment',
    Boolean = 'bool',
    Channel = 'channel',
    Mentionable = 'mentionable'
}

interface CommandOption {
    name: string,
    description: string,
    type: CommandOptionType
    required: boolean,
}

export {
    ASlashCommand,
    ASlashSubCommand,
    CommandOption,
    CommandOptionType
};