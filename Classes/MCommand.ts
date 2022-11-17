// Class that all command scrips use.
import { SlashCommandBuilder } from 'discord.js';

type Categories =
    'Moderación' |
    'Música' |
    'Random' |
    'Gestión de roles' |
    'Canales de voz temporales' |
    'Utilidad';

type CommandType = 'Slash' | 'Prefix' | 'Slash&Prefix';

export default class MCommand {
    // Variables.
    public data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    public aliases: string[];
    public category: Categories;
    public botPerms: bigint[];
    public userPerms: bigint[];
    public cooldown: number;
    public commandType: CommandType;
    public execute: Function;
    public executeSlash: Function = () => { return; };
    // Constructor.
    /**
     * 
     * @param aliases Array of all possible aliases for that comamnd.
     * @param category Category for that command. Can be: 'Moderación', 'Música', 'Random', 'Gestión de roles', 'Canales de voz temporales', 'Utilidad'.
     * @param botPerms Necessary permissions the bot requires to run the command.
     * @param userPerms Permissions the user requires to run the command.
     * @param cooldown Cooldown for using the command in seconds.
     * @param commandType Type of command to be executed ('Slash', 'Prefix', 'Slash&Prefix')
     * @param execute Function that executes the command. execute(client: Client, message: Message, prefix: string, ...args: string[]).
     */
    constructor(data: SlashCommandBuilder, aliases: string[], category: Categories, botPerms: bigint[], userPerms: bigint[], cooldown: number, commandType: CommandType, execute: Function) {
        this.data = data;
        this.aliases = aliases;
        this.category = category;
        this.botPerms = botPerms;
        this.userPerms = userPerms;
        this.cooldown = cooldown;
        this.commandType = commandType;
        this.execute = execute;
    }
}