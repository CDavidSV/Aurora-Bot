// Show a user´s avatar.
import { User } from 'discord-voice';
import { Message, EmbedBuilder, ColorResolvable, SlashCommandBuilder, ChatInputCommandInteraction, CacheType, PermissionsBitField, Client, AttachmentBuilder, GuildMember, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, ButtonInteraction, InteractionCollector, SelectMenuInteraction } from 'discord.js';
import MCommand from '../../Classes/MCommand';
import config from '../../config.json';
import { client } from '../../index';

const errorImg = new AttachmentBuilder(config.embeds.images.errorImg);

const row = new ActionRowBuilder<ButtonBuilder>()
.addComponents(
    new ButtonBuilder()
        .setCustomId('user')
        .setLabel('View User Avatar')
        .setStyle(ButtonStyle.Primary),
);

function collectorManager(collector: InteractionCollector<ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>>, interaction: ChatInputCommandInteraction<CacheType> | null, message: Message | null, avatarEmbed: EmbedBuilder, member: GuildMember){
    collector.on('collect', async (interactionBtn: ButtonInteraction) => {
        switch(interactionBtn.customId) {
            case 'user':
                avatarEmbed
                    .setTitle(`Avatar of ${member.user.tag}`)
                    .setImage(member.user.displayAvatarURL({size: 2048}))
                    .setColor(config.embeds.colors.main as ColorResolvable)
                    .setDescription(`[Image URL](${member.user.displayAvatarURL({size: 2048})})`)

                if(interaction) {
                    interaction.editReply({components: []});
                } else if (message) {
                    message.edit({components: [] });
                }
                
                await interactionBtn.reply({embeds: [avatarEmbed]}).catch(() => {});

                break;
            default:
                return;
        }
        collector.removeAllListeners();
        collector.stop();
    });
}

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription("Shows you a guild member's avatar.")
        .addUserOption(option =>
            option.setName('user')
            .setDescription('User Mention')
            .setRequired(false))
        .setDMPermission(false),
    aliases: ['avatar'],
    category: 'Utilidad',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    cooldown: 0,
    commandType: 'Slash&Prefix',

    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        const channel = client.channels.cache.get(message.channel!.id)! as TextChannel;
        
        const collector = channel.createMessageComponentCollector();
        const avatarEmbed = new EmbedBuilder();
        // Convert args to lowercase.
        args = args.map(arg => arg.toLowerCase());

        const { guild } = message;

        let member;
        if (args.length > 1) {
            const userID = args[1].replace(/[<@!&>]/g, '');
            member = guild!.members.cache.get(userID);
        }

        if(!member) {
            member = message.guild!.members.cache.find(member => member.displayName.toLowerCase().includes(args[1]) || member.user.username.toLocaleLowerCase().includes(args[1]))!;
            if(!member && args.length > 1) {
                avatarEmbed
                    .setColor(config.embeds.colors.errorColor as ColorResolvable)
                    .setAuthor({ name: 'El rol o usuario no existe. Intenta mencionarlos.', iconURL: 'attachment://error-icon.png' })
                message.reply({ embeds: [avatarEmbed], files: [errorImg] });
                return;
            }
        }
        if(!member) {
            member = message.member as GuildMember;
        }

        avatarEmbed
            .setTitle(`Avatar of ${member.user.tag}`)
            .setImage(member.displayAvatarURL({size: 2048}))
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(`[Image URL](${member.displayAvatarURL({size: 2048})})`)

        let messageReply;
        if(member.displayAvatarURL({size: 2048}) == member.user.displayAvatarURL({size: 2048})) {
            messageReply = await message.reply({embeds: [avatarEmbed], allowedMentions: { repliedUser: false }});
        } else {
            messageReply = await message.reply({embeds: [avatarEmbed], allowedMentions: { repliedUser: false }, components: [row] });
        }

        collectorManager(collector, null, messageReply, avatarEmbed, member);
    },

    async executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        const channel = client.channels.cache.get(interaction.channel!.id)! as TextChannel;
        const collector = channel.createMessageComponentCollector();
        const avatarEmbed = new EmbedBuilder();

        let member: GuildMember;
        if(!interaction.options.getUser('user')) {
            member = interaction.guild!.members.cache.get(interaction.member!.user.id)!;
        } else {
            member = interaction.guild!.members.cache.get(interaction.options.getUser('user')!.id) as GuildMember;
        }
        
        avatarEmbed
            .setTitle(`Avatar of ${member.user.tag}`)
            .setImage(member.displayAvatarURL({size: 2048}))
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(`[Image URL](${member.displayAvatarURL({size: 2048})})`)
        
        if(member.displayAvatarURL({size: 2048}) == member.user.displayAvatarURL({size: 2048})) {
            interaction.reply({embeds: [avatarEmbed]});
        } else {
            interaction.reply({embeds: [avatarEmbed], components: [row]});
        }

        collectorManager(collector, interaction, null, avatarEmbed, member);
    }
} as MCommand