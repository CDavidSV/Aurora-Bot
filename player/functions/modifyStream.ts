import ffmpeg from 'fluent-ffmpeg';
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

export function modifyStream(stream: any, streamSettings: { outputOption: string[], startTimeInSec: number } = { outputOption: [], startTimeInSec: 0 }) {
    // Modify the stream depending on the selected option.
    let outputOptionsString = '';

    let modifiedStream: ffmpeg.FfmpegCommand;

    if (streamSettings.outputOption.length === 0) {
        modifiedStream = ffmpeg({ source: stream }).toFormat('mp3').setStartTime(streamSettings.startTimeInSec);
        return modifiedStream;
    }

    if (streamSettings.outputOption.includes('bassboost')) {
        outputOptionsString += 'bass=g=15, ';
    }
    if (streamSettings.outputOption.includes('nightcore')) {
        outputOptionsString += 'asetrate=44100*1.25, aresample=48000, ';
    }
    if (streamSettings.outputOption.includes('daycore')) {
        outputOptionsString += 'asetrate=44100*0.91, aresample=48000, ';
    }
    if (streamSettings.outputOption.includes('reverb')) {
        outputOptionsString += 'aecho=1.0:0.7:20:0.5, ';
    }
    outputOptionsString += 'dynaudnorm=f=100'

    modifiedStream = ffmpeg({ source: stream }).outputOptions('-af', outputOptionsString).toFormat('mp3').setStartTime(streamSettings.startTimeInSec);
    return modifiedStream;
}