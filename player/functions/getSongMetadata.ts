import ytdl from "ytdl-core";
import ytpl from "ytpl";
import Metadata from "../Classes/SongMetadata";

// Gets metadata for the song.
export async function getSongMetadata(request: string, type: string) {
    let title;
    let thumbnail;
    let url;
    let durationSec;
    let durationTimestamp;
    switch (type) {
        case 'ytvideo':
            // Get video metadata.
            let info;
            try {
                info = await ytdl.getBasicInfo(request)
            } catch {
                return;
            }
            
            if (info.videoDetails.isLiveContent) {
                type = 'ytlive';
            } else {
                type = 'ytvideo';
            }
            title = info.videoDetails.title;
            url = request;
            thumbnail = info.videoDetails.thumbnails[3].url;
            durationSec = parseInt(info.videoDetails.lengthSeconds);

            if (parseInt(info.videoDetails.lengthSeconds) < 3600) {
                durationTimestamp = new Date(durationSec * 1000).toISOString().slice(14, 19);
            } else {
                durationTimestamp = new Date(durationSec * 1000).toISOString().slice(11, 19);
            }
            break;
        }
    return new Metadata(type, title, url, durationTimestamp, durationSec, thumbnail);
}