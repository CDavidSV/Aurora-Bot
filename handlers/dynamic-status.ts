// Automatically changes the bots status every specified ammount of time.
import { ActivityType, Client } from 'discord.js';
import { client } from '../index';

let statuses: string[] = [];
let currentIndex = 0;

function updateStatuses() {
    const statuses: string[] = [
        'ma!help',
        `ma!help | ${formatNumbers(client.guilds.cache.size)} Servers`,
        `ma!help | ${formatNumbers(client.channels.cache.size)} Channels`,
        `ma!help | ${formatNumbers(client.users.cache.size)} Users`,
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
    if(currentIndex > statuses.length - 1) currentIndex = 0;
    client.user!.setActivity(statuses[currentIndex], { type: ActivityType.Listening });
    currentIndex++;
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