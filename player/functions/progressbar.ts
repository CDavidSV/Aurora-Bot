// Returns a string representing the progresss bar of a video.

function convertTimeStamp(time: number) {
    let durationTimestamp;
    if (time < 3600) {
        durationTimestamp = new Date(time * 1000).toISOString().slice(14, 19);
    } else {
        durationTimestamp = new Date(time * 1000).toISOString().slice(11, 19);
    }

    return durationTimestamp;
}

export function progressBar(totalDuration: number | null, currentTime: number) {
    let progressBar: string = "";
    let currentProgressInTime:string;

    // ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ 24
    const totalBars = 24;
    const currentBars = Math.round(currentTime * totalBars / totalDuration!);

    for (let i = 0; i < 24; i++) {
        if(i < currentBars) {
            progressBar += "▬";
        } else {
            progressBar += "-";
        }
    }
    currentProgressInTime = `[${convertTimeStamp(currentTime)}/${convertTimeStamp(totalDuration!)}]`;
    progressBar += ` ${currentProgressInTime}`;

    return progressBar;
}