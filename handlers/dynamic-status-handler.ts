import { ActivityType, Client } from "discord.js";

interface Status {
    text: string,
    object: any
}

function formatNumbers(n: number) {
    const numberArray = n.toString().split('');
    let formattedArray = [];

    let counter = 1;
    for (let i = numberArray.length - 1; i >= 0; i--) {
        formattedArray.unshift(numberArray[i]);

        if (counter % 3 === 0) 
            formattedArray.unshift(',');

        counter++;
    }
    
    return formattedArray.join("");
}

export default {
    run(client: Client) {
        const statuses: Status[]  = [
            {text: `in ${formatNumbers(client.guilds.cache.size)} Servers`, object: { type: ActivityType.Playing } },
            {text: `${formatNumbers(client.channels.cache.size)} Channels`, object: { type: ActivityType.Listening } },
            {text: `with ${formatNumbers(client.users.cache.size)} Users`, object: { type: ActivityType.Playing } }
        ]

        let currentIndex = 0;
        const halfHour = 1800000;

        client.user!.setActivity(statuses[currentIndex].text, statuses[currentIndex].object);
        setInterval(() => {
            if (currentIndex + 1 > statuses.length) {
                currentIndex = 0;
            } else {
                currentIndex++;
            }

            const currentStatus = statuses[currentIndex];
            client.user!.setActivity(currentStatus.text, currentStatus.object);
        }, halfHour)
    }
}