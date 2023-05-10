import { Client, CommandInteraction, DMChannel, Guild, GuildMember, Message, TextChannel, User } from "discord.js";

export interface CommandResponse {
    client: Client;
    message?: Message | null;
    interaction?: CommandInteraction | null;
    args: string[] | null;
    guild?: Guild | null;
    member?: GuildMember;
    user: User;
    channel?: TextChannel | DMChannel;
}

export enum CommandType {
    SLASH = 'slash',
    LEGACY = 'prefix',
    BOTH = 'both',
}

export enum CommandOptionType {
    String = 'string',
    Integer = 'integer',
    Number = 'number',
    Role = 'role',  
    Attachment = 'attachment',
    Boolean = 'bool',
    Channel = 'channel',
    Mentionable = 'mentionable'
}

export interface CommandOption {
    name: string,
    description: string,
    type: CommandOptionType
    required: boolean,
}

export class ACommand {
    public slashCategory?: string;
    public name: string;
    public aliases?: string[];
    public description: string;
    public type: CommandType;
    public options?: CommandOption[];
    public botPerms?: bigint[];
    public userPerms?: bigint;
    public DM?: boolean = false;
    public callback: Function = () => {};

    constructor(slashCategory: string, name: string, aliases: string[], description: string, type: CommandType, options: CommandOption[], botPerms: bigint[], userPerms: bigint) {
        this.slashCategory = slashCategory;
        this.name = name;
        this.aliases = aliases;
        this.description = description;
        this.type = type;
        this.options = options;
        this.botPerms = botPerms;
        this.userPerms = userPerms;
    }
}