import DiscordJS, { Intents } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();
let prefix = '%';

// Create client and add intents.
const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

client.on('ready', bot => {
    console.log(`Logged in succesfully as ${bot.user.tag}`);
});

// Normal commands with prefix.
client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.content === 'ping') {
        message.reply('pong');
    }

})

// Token.
client.login(process.env.TOKEN);