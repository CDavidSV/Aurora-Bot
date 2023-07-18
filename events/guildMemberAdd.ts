import { AttachmentBuilder, ColorResolvable, EmbedBuilder, Events, Guild, Interaction, TextBasedChannel, User } from "discord.js";
import canvas from "canvas"
import config from "../config.json";
import guildScheema from "../scheemas/guildScheema";

const resizeText = (canvas: canvas.Canvas, text: string) => {
    const context = canvas.getContext('2d');

    // Declare a base size of the font.
    let fontSize = 100;
  
    do {
      // Assign the font to the context and decrement it so it can be measured again.
      context.font = `${fontSize -= 10}px sans-serif`;
      // Compare pixel width of the text to the canvas minus the approximate avatar size.
    } while (context.measureText(text).width > canvas.width - 700);
  
    // Return the result to use in the actual canvas.
    return context.font;
}

const generateWelcomeImage = async (img: string, user: User) => {
    if (!img || !user) return [];

    // Create the welcome image canvas.
    const imageCanvas = canvas.createCanvas(1920, 900);
    const ctx = imageCanvas.getContext("2d");

    // Retrieve image from url and convert.
    let background;
    try {
        background = await canvas.loadImage(img);
    } catch {
        return [];
    }

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

    // Draw text in the canvas.
    ctx.font = 'bold 100px sans-serif'
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 6;
    ctx.shadowBlur = 10;
    ctx.fillText("WELCOME", imageCanvas.width / 2 - ctx.measureText('WELCOME').width / 2, imageCanvas.height / 2 + 260);
    ctx.font = resizeText(imageCanvas, user.username);
    ctx.fillText(user.username, imageCanvas.width / 2 - ctx.measureText(user.username).width / 2, imageCanvas.height / 1.65 + 260);

    // Get users pfp and add it to the canvas welcome image.
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(imageCanvas.width / 2, imageCanvas.height / 2 - 150, 250, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    const pfp = await canvas.loadImage(user.displayAvatarURL({ extension: 'jpg', size: 512 }));
    ctx.drawImage(pfp, imageCanvas.width / 2 - 250, imageCanvas.height / 2 - 400, 500, 500);

    // Draws a border arround the pfp.
    ctx.beginPath();
    ctx.arc(imageCanvas.width / 2, imageCanvas.height / 2 - 150, 250, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.strokeStyle = config.embeds.colors.main;
    ctx.lineWidth = 15;
    ctx.stroke();

    // Get the canvas generated image and create a message attachment.
    const file = new AttachmentBuilder(imageCanvas.toBuffer(), { name: "welcome-image.png" });

    return [file];
}

const generateWelcomeResponse = async (guildSettings: any, user: User, guild: Guild) => {
    let message: string = guildSettings.welcome.welcome_message || `<@${user.id}> just joined the server! Come say Hi 👋`;
    const image = await generateWelcomeImage(guildSettings.welcome.welcome_image, user as User);

    message = message.replace(/{\s*username\s*}/gm, user.username);
    message = message.replace(/{\s*mention\s*}/gm, `<@${user.id}>`);
    message = message.replace(/{\s*id\s*}/gm, user.id);
    message = message.replace(/{\s*server\s*}/gm, guild.name);
    message = message.replace(/{\s*members\s*}/gm, guild.memberCount.toString());
        
    // Check if the message should be sent as an embed or normal message
    if (guildSettings.welcome.embed) {
        // Generate the emped
        const welcomeEmbed = new EmbedBuilder()
            .setAuthor({ name: guild?.name as string, iconURL: guild?.iconURL() as string})
            .setDescription(message)
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setImage("attachment://welcome-image.png")
            .setTimestamp()
        
        return { embeds: [welcomeEmbed], files: image };
    }

    return { content: message, files: image };
}

export default {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(interaction: Interaction) {
        // Check if the server the user joined has welcome messages enabled.
        try {
            const guildSettings = await guildScheema.findById(interaction.guild?.id);

            // If the guild is not in the db then do nothing.
            // Check if the guild has welcome messages enabled.
            if (!guildSettings || !guildSettings.welcome || !guildSettings.welcome.welcome_channel) return;

            // Send a welcome message in the corresponding channel.
            const channel: TextBasedChannel = interaction.guild?.channels.cache.get(guildSettings.welcome.welcome_channel)! as TextBasedChannel;
            const respose = await generateWelcomeResponse(guildSettings, interaction.user, interaction.guild!);

            await channel.send(respose);
        } catch (err) {
            console.error(err);
        }
    }
}

export { generateWelcomeResponse }