const { Guild } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Returns Latency of the Bot and API service.",
    execute(client, message, MessageEmbed) {
        const pingEmbed = new MessageEmbed().setDescription('Calculating...')
        message.channel.send({ embeds: [pingEmbed] }).then(resultMessage => {
            const ping = resultMessage.createdTimestamp - message.createdTimestamp;
            pingEmbed
                .setAuthor({ name: 'Marin Bot', iconURL: client.user.avatarURL() })
                .setDescription('')
                .setColor('#FFDA2E')
                .addFields(
                    { name: 'Bot Latency: ', value: `${ping}ms` },
                    { name: 'API Latency: ', value: `${client.ws.ping}ms` }
                )
                .setTimestamp()
            resultMessage.edit({ embeds: [pingEmbed] });
        })

    }
}