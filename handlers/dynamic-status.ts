// Automatically changes the bots status every specified ammount of time.
import { ActivityType, Client } from 'discord.js';
import { client } from '../index';
import playercore from '../player/playercore';

let statuses: string[] = [];

function updateStatuses() {
    const statuses: string[] = [
        'ma!help',
        `ma!help | ${formatNumbers(client.guilds.cache.size)} Servers`,
        `ma!help | ${formatNumbers(client.channels.cache.size)} Channels`,
        `ma!help | ${formatNumbers(client.users.cache.size)} Users`,
        `ma!help | ${formatNumbers(playercore.getServerQueues().size)} Voice Channels`,
    ];

    return statuses;
}

function formatNumbers(number: number) {
    let numberString: string = "";
    let numberStringRev: string = "";
    const numbersArr = String(number).split("");

    let counter = 1;
    for (let i = numbersArr.length - 1; i > -1; i--) {
        if (counter % 4 === 0) {
            numberString += ','
        }
        numberString += numbersArr[i];
        counter++;
    }
    for (let i = numberString.length - 1; i > -1; i--) {
        numberStringRev += numberString[i];
    }

    return numberStringRev;
}

function changeStatus(client: Client) {
    const randomIndex = Math.floor(Math.random() * statuses.length);
    client.user!.setActivity(statuses[randomIndex], { type: ActivityType.Listening })
}

export default {
    run() {
        const halfHour = 1800000;

        statuses = updateStatuses();
        changeStatus(client);

        setInterval(() => {
            statuses = updateStatuses();
            changeStatus(client);
        }, halfHour)
    }
}