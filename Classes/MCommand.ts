// Class that all command scrips use.
import { PermissionsBitField, SlashCommandBuilder } from 'discord.js';

type Categories =
    'Moderación' |
    'Música' |
    'Random' |
    'Gestión de roles' |
    'Canales de voz temporales' |
    'Utilidad';

export default class MCommand {
    // Variables.
    public data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    public aliases: string[];
    public category: Categories;
    public botPerms: bigint[];
    public userPerms: bigint[];
    public execute: Function;
    // Constructor.
    /**
     * @param name Name of the command.
     * @param aliases Array of all possible aliases for that comamnd.
     * @param category Category for that command. Can be: 'Moderación' , 'Música' , 'Random' , 'Gestión de roles' , 'Canales de voz temporales' , 'Utilidad'.
     * @param botPerms Necessary permissions the bot requires to run the command.
     * @param onlySlash If the command can only be a slash command and not a normal one.
     * @param execute Function that executes the command. execute(client: Client, message: Message, prefix: string, ...args: string[]).
     */
    constructor(data: SlashCommandBuilder, aliases: string[], category: Categories, botPerms: bigint[], userPerms: bigint[], execute: Function) {
        this.data = data;
        this.aliases = aliases;
        this.category = category;
        this.botPerms = botPerms;
        this.userPerms = userPerms;
        this.execute = execute;
    }
}