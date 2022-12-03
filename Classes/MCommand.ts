// Class that all command scrips use.

export type Categories =
    'Moderación' |
    'Música' |
    'Random' |
    'Gestión de roles' |
    'Canales de voz temporales' |
    'Utilidad' |
    'Juegos';

export type InputOption = {
    name: string,
    description: string,
    type: InputType,
    maxLen: number | null,
    minLen: number | null,
    required: boolean
};

export type InputType = 'Role' | 'User' | 'Number' | 'String' | 'Boolean' | 'Channel' | 'Integer' | 'Attachment' | 'Mentionable';

export type CommandType = 'Slash' | 'Prefix' | 'Slash&Prefix';

export default class MCommand {
    // Variables.
    public slashCategory: string | null;
    public name: string;
    public description: string;
    public DM: boolean;
    public subOptions: { name: string, description: string, inputOptions: InputOption[] }[];
    public inputOptions: InputOption[];
    public aliases: string[];
    public category: Categories;
    public botPerms: bigint[];
    public userPerms: bigint[];
    public cooldown: number;
    public commandType: CommandType;
    public execute: Function = () => { return; };
    public executeSlash: Function = () => { return; };

    // Constructor.
    /**
     * @param slashCategory
     * @param name
     * @param description
     * @param DM
     * @param aliases
     * @param category
     * @param botPerms
     * @param userPerms
     * @param cooldown
     * @param commandType
     * @param execute
     */
    constructor(slashCategory: string | null, name: string, description: string, DM: boolean, options: { name: string, description: string, inputOptions: InputOption[] }[], inputOptions: InputOption[], aliases: string[], category: Categories, botPerms: bigint[], userPerms: bigint[], cooldown: number, commandType: CommandType, execute: Function) {
        this.slashCategory = slashCategory;
        this.name = name;
        this.description = description;
        this.DM = DM;
        this.subOptions = options;
        this.inputOptions = inputOptions;
        this.aliases = aliases;
        this.category = category;
        this.botPerms = botPerms;
        this.userPerms = userPerms;
        this.cooldown = cooldown;
        this.commandType = commandType;
        this.execute = execute;
    }
}