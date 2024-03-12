import { AttachmentBuilder, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js";
import config from '../../../config.json';
import rpImagesScheema from "../../../scheemas/rpImagesSchema";
import canvas from "canvas";
import path from "path";

const randomMessage = (percentage: number) => {
    const shipLines = [["The universe seems to be conspiring to keep these hearts apart.", 
                        "Looks like your stars are playing hard to get, just like your hearts.",
                        "Even Romeo and Juliet had better odds than this duo!",
                        "They say love is blind, but this match might need some glasses.",
                        "Even shooting stars have a better chance at collision than these two.",
                        "There's a hint of magic in the air, but it seems you two are playing a slow-burning serenade."], // 0 to 10%
                        
                        ["With a sprinkle of hope and a dash of fate, there might be something brewing here, maybe...",
                        "You're on the path to affection, but it's like love's taking the scenic route.",
                        "Your affinity is like a shy blush on a first date—promising, yet delicate.",
                        "Your affinity might be a gentle breeze now, but who knows what it could blossom into?",
                        "Affection's seed has been planted, and it's starting to take root in your hearts.",
                        "The stars are aligning for these hearts, painting a picture of love that's waiting to be unveiled."], // 10% to 40%
                        
                        ["There's a cozy campfire of affection burning between them, warming their souls.",
                        "Your hearts might be in the 'getting to know you' phase, but every story has its beginning.",
                        "Hey, sparks are glowing between you two, taking their time to turn into flames.",
                        "Sparks are dancing in the air, whispering secrets only hearts can hear.",
                        "You two are in the sweet spot of possibilities, where sparks turn into flames.",
                        "Looks like your hearts are exchanging shy hellos, building a bridge between you.",
                        "Your connection is blossoming, like a flower reaching for the sun."], // 40% to 60%
                    
                        ["Your hearts are tuned to the same frequency, a melody of potential.",
                        "Love's light is shining a bit brighter on your path.",
                        "Your connection is like a poem waiting to be written.",
                        "Your hearts have found a rhythm, a dance of mutual affinity.",
                        "Sparks are igniting a beautiful journey between you two.",
                        "Your connection is like a sunrise, bringing warmth to each other's worlds.",
                        "The universe has woven a thread of love between you two.",
                        "Your bond is like a promise whispered on a gentle breeze."], // From 60% to 80% 

                        ["Your hearts are painting a canvas of love with every shared moment.",
                        "Hey, your hearts seem to have found their missing pieces in each other.",
                        "Your connection is like a map leading to a treasure of affection.",
                        "It's like your hearts are sharing a secret language only you understand.",
                        "Your bond feels like a book written by fate, with chapters waiting to be explored."], // From 80% 90%
                        
                        ["It's like the universe is applauding your affinity, a true match.",
                        "The bond you share is like a beautiful melody, resonating in perfect harmony.",
                        "Your connection feels like destiny, a story written in the stars.",
                        "Your connection is like poetry, every word flowing effortlessly.",
                        "It's like the universe held its breath and created a perfect match.",
                        "Your connection is the kind that movies are made of, pure and magical.",
                        "Your connection is as close to destiny as two hearts can get."]] // From 90% to 100%

    const percentageRanges = [10, 40, 60, 80, 90, 100]                  
    const linesIndex = percentageRanges.findIndex((range) => percentage <= range)
    const lines = shipLines[linesIndex];

    // Return a random line.
    return lines[Math.floor(Math.random() * lines.length)];
}

const shipImage = async (user1: User, user2: User, shipImg: string, percentage: string) => {
    const imageCanvas = canvas.createCanvas(900, 300);
    const ctx = imageCanvas.getContext("2d");

    const background = await canvas.loadImage(shipImg);
    const overlay = await canvas.loadImage(path.resolve(__dirname, "../../../assets/command-images/ship.png") )

    // Center the image based on its size in relation to the canvas.
    let x = 0;
    let y = 0;
    let imageWidth = background.width;
    let imageHeight = background.height;
    const canvasAspectRatio = imageCanvas.width / imageCanvas.height;
    const imageAspectRatio = imageWidth / imageHeight;

    if (imageAspectRatio > canvasAspectRatio) {
        imageHeight = imageCanvas.height;
        imageWidth = imageCanvas.height * imageAspectRatio;
    } else {
        imageWidth = imageCanvas.width;
        imageHeight = imageCanvas.width / imageAspectRatio;
    }
    
    if (imageWidth > imageCanvas.width) x = - imageWidth / 2 + imageCanvas.width / 2;
    if (imageHeight > imageCanvas.height) y = - imageHeight / 2 + imageCanvas.height / 2;

    ctx.drawImage(background, x, y, imageWidth, imageHeight);
    ctx.drawImage(overlay, 0, 0, 900, 300);

    // Display ship percentage.
    ctx.font = 'bold 40px sans-serif'
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 6;
    ctx.shadowBlur = 10;
    const percentageTextSize = ctx.measureText(percentage);

    ctx.fillText(percentage, imageCanvas.width / 2 - percentageTextSize.width / 2, imageCanvas.height / 2 + 15);

    // Draw image pfps.
    const pfp1 = await canvas.loadImage(user1.displayAvatarURL({ extension: 'jpg', size: 512 }));
    const pfp2 = await canvas.loadImage(user2.displayAvatarURL({ extension: 'jpg', size: 512 }));
    const imgSize = 212;

    ctx.beginPath();
    ctx.arc(160, 150, imgSize / 2, 0, Math.PI * 2, true);
    ctx.arc(740, 150, imgSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(pfp1, 160 - imgSize / 2, 150 - imgSize / 2, imgSize, imgSize);
    ctx.drawImage(pfp2, 740 - imgSize / 2, 150 - imgSize / 2, imgSize, imgSize);

    const file = new AttachmentBuilder(imageCanvas.toBuffer(), { name: "ship.png" });

    return file;
}

export default {
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('💕 Show romantic affinity between two members')
        .addUserOption(option =>
            option
                .setName('member_1')
                .setDescription('Select the first member')
                .setRequired(true))
        .addUserOption(option => 
            option
                .setName('member_2')
                .setDescription('Select the second member')
                .setRequired(true))
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({ ephemeral: false });
        
        let randomPercentage = Math.floor(Math.random() * 100);
        let message = randomMessage(randomPercentage);
        const user1 = interaction.options.getUser('member_1', true);
        const user2 = interaction.options.getUser('member_2', true);
        const shipImg = await rpImagesScheema.aggregate([{ $match: {rp_type: "ship"} }, { $sample: { size: 1 } }]).then(docs => docs[0]);

        const file = await shipImage(user1, user2, shipImg?.img_url!, `${randomPercentage}%`);

        const shipEmbed = new EmbedBuilder()
            .setTitle(`:heart: ${message}`)
            .setDescription(`**Affinity:** ${randomPercentage}%`)
            .setImage("attachment://ship.png")
            .setColor(config.embeds.colors.main as ColorResolvable)
        await interaction.followUp({ embeds: [shipEmbed], files: [file] });
    }
}