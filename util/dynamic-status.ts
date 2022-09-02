// Automatically changes the bots status every specified ammount of time.
import { ActivityType, Client } from 'discord.js';
import { client } from '../index';

let statuses: { status: string, type: any, }[] = [];

function updateStatuses() {
    const statuses: { status: string, type: any }[] = [
        { status: 'ma!help', type: ActivityType.Listening },
        { status: `in ${formatNumbers(client.guilds.cache.size)} Servers`, type: ActivityType.Playing },
        { status: `in ${formatNumbers(client.channels.cache.size)} Channels`, type: ActivityType.Playing },
        { status: `with ${formatNumbers(client.users.cache.size)} Users`, type: ActivityType.Playing }
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
    client.user!.setActivity(statuses[randomIndex].status, { type: statuses[randomIndex].type })
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