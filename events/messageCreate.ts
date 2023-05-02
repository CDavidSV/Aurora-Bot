// import { AttachmentBuilder, ChannelType, ColorResolvable, EmbedBuilder, Events, Message } from "discord.js";
// import { CommandResponse, CommandType } from "../structs/ACommand";
// import config from "../config.json";

// // Error image.
// const file = new AttachmentBuilder(config.embeds.images.errorImg);

// export default { 
//     name: Events.InteractionCreate,
//     once: false,
//     async execute(message: Message) {
//         if (message.author.bot || message.channel.type === ChannelType.DM) return;

//     // Get all guild prefixes.
//     let guildPrefixes: any = prefixHandler.getGuildPrefixes();

//     let prefix: string | undefined;
//     for (let globalPrefix of globalPrefixes) {
//         if (message.content.startsWith(globalPrefix)) {
//             prefix = globalPrefix;
//             break;
//         } else {
//             prefix = guildPrefixes[message.guild!.id];
//         }
//     }
//     if (!prefix || !message.content.startsWith(prefix)) return;

//     // Rmoves prefix and converts the message into lowercase.
//     const sliceParameter = prefix.length;

//     const args = message.content.slice(sliceParameter).split(" ").filter((element: String) => element != '');
//     if(args.length === 0) return; 

//     const commandName = args.slice().shift()!.toLowerCase();

//     const command = message.client.commands.find(c => c.aliases.includes(commandName))!;

//     // No such command name found or is only of slash command type.
//     if (!command || command.type === CommandType.LEGACY) return;

//     if (!message.member!.permissions.has(command.userPerms)) {
//         const noPermissions = new EmbedBuilder()
//             .setColor(config.embeds.colors.error as ColorResolvable)
//             .setAuthor({ name: `You don't have permission to use this command`, iconURL: 'attachment://error-icon.png' })
//         message.reply({ embeds: [noPermissions], files: [file], allowedMentions: { repliedUser: false } });
//         return;
//     }

//     if (!message.guild!.members.me!.permissions.has(command.botPerms)) {
//         const noPermissions = new EmbedBuilder()
//             .setColor(config.embeds.colors.error as ColorResolvable)
//             .setAuthor({ name: `I don't have sufficient permissions to perform this action.`, iconURL: 'attachment://error-icon.png' })
//             .addFields({ name: 'Required Permissions', value: command.botPerms.toString() })
//         message.reply({ embeds: [noPermissions], files: [file] });
//         return;
//     }

//     // Execute Command.
//     try {
//         const content = command.callback!({
//             client: message.client,
//             message,
//             args,
//             guild: message.guild,
//             member: message.member,
//             user: message.member?.user,
//             channel: message.channel
//         } as CommandResponse); // Executes command.

        
//     } catch (error) {
//         const unexpectedError = new EmbedBuilder() 
//             .setColor(config.embeds.colors.error as ColorResolvable)
//             .setAuthor({ name: 'Unnexpected Error on my part, sorry for the inconvinience', iconURL: 'attachment://error-icon.png' })
//         message.reply({ embeds: [unexpectedError], files: [file] });
//     }
//     }
// }