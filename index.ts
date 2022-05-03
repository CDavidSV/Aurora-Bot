import DiscordJS, { Intents, MessageEmbed } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();
let prefix = '-';

// Create client and add intents.
const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

const commands: any = new DiscordJS.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    commands.set(command.name, command);
}

client.on('ready', bot => {
    console.log(`Successfully logged in as ${bot.user.tag}`);
});

// Normal commands with prefix.
client.on('messageCreate', message => {
    // Verify that the message author is not the bot and that it has the correct prefix
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    // Rmoves prefix and converts the message into lowercase.
    const command = message.content.slice(prefix.length).toLowerCase().split(" ");

    // Commands.
    switch (command[0]) {
        case 'ping':
            commands.get('ping').execute(client, message, MessageEmbed);
            break;
        case 'verification':
            message.reply('Coming soon...');
            break;
        default:
            const noCommandEmbed = new MessageEmbed()
                .setColor('#FF0000')
                .setDescription('Error: No Such Command')
            message.reply({ embeds: [noCommandEmbed] });
    }
})

// Token.
client.login(process.env.TOKEN);