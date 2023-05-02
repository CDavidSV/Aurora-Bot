import { ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../config.json";

const eightBall = (botAvatar: string, prompt: string) => {
    const answers = ['🟢 It is certain.','🟢 It is decidedly so.','🟢Without a doubt.','🟢 Yes definitely.','🟢 You may rely on it.','🟢 As I see it, yes.','🟢 Most likely.','🟢 Outlook good.','🟢 Yes.','🟢 Signs point to yes.','🟡 Reply hazy, try again.','🟡 Ask again later.','🟡 Better not tell you now.','🟡 Cannot predict now.','🟡 Concentrate and ask again.',`🔴 Don't count on it.`,'🔴 My reply is no.','🔴 My sources say no.','🔴 Outlook not so good.', '🔴 Very doubtful.'];

    return new EmbedBuilder()
        .setAuthor({ name: 'Marin Bot', iconURL: botAvatar })
        .setColor(config.embeds.colors.main as ColorResolvable)
        .addFields(
            { name: 'Question: ', value: `${prompt}` },
            { name: 'Magical Ball Says: ', value: `${answers[Math.floor(Math.random() * answers.length)]}` }
        )
}

const dice = () => {
    const dices: string[] = [':one:', ':two:', ':three:', ':four:', ':five:', ':six:'];
    const random = Math.floor(Math.random() * 6);

    return dices[random];
}

const coinflip = (username: string) => {
    const random = Math.floor(Math.random() * 1);

    if (random == 1) {
        return `🪙 ${username} flipped a coin and got **Tails**`;
    }
    return `🪙 ${username} flipped a coin and got **heads**`;
}

const rps = () => {

}

export default {
    eightBall,
    coinflip,
    dice,
    rps,
}