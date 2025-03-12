import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'fs';
import { execSync } from 'child_process';
import path, { join } from 'path';

import { Video as VideoType } from '@sonarrTube/types/youtube/Video.js';
import { Video } from '@sonarrTube/models/api/youtube/Video.js';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo.js';
import { cachePath } from '@sonarrTube/helpers/Cache.js';
import { config } from '@sonarrTube/helpers/Config.js';
import { log } from '@sonarrTube/helpers/Log.js';
import { getYoutubeDelayString } from '@sonarrTube/helpers/Generic.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';

const { isDocker } = config();

/* istanbul ignore next */
const ytdlp_path = isDocker ? '/app/.local/bin/yt-dlp' : 'yt-dlp';

const cacheKeyBase = (cacheKey: string): string => cachePath(`youtube/${cacheKey}`);
const getAllVideoInfoCommand = (cacheKey: string, url: string): string => {
    const cacheBase = cacheKeyBase(cacheKey);

    return [
        ytdlp_path,
        '--write-info-json',
        '--skip-download',
        '--force-write-archive',
        `--cache-dir ${cacheKeyBase('.cache')}`,
        `--download-archive "${cacheBase}/videos.txt"`,
        '--match-filter \'duration>120 & availability!=private & availability!=premium_only & ' +
        'availability!=subscriber_only\'',
        '--parse-metadata "video::(?P<heatmap>)" --parse-metadata "video::(?P<automatic_captions>)"',
        '--parse-metadata "video::(?P<thumbnails>)"',
        '--parse-metadata "video::(?P<tags>)"',
        `--parse-metadata "video::(?P<formats>)" -o "${cacheBase}/%(id)s.%(ext)s"`,
        '--compat-options no-youtube-unavailable-videos',
        url
    ].join(' ');
};

const processVideoInfos = (cacheKey: string): Video[] => {
    const cachePath = cacheKeyBase(cacheKey);
    const files = readdirSync(cachePath);

    return files
        .filter(file => file.match(/.*json.*/))
        .map(file => JSON.parse(
            readFileSync(path.join(cachePath, file)).toString()
        ))
        .filter(videoInfo => videoInfo._type == 'video')
        .map(({
            title,
            fulltitle,
            thumbnail,
            description,
            channel_id,
            channel_url,
            channel,
            duration,
            view_count,
            webpage_url,
            id,
            timestamp,
            upload_date,
        }) => new Video({
            title,
            fulltitle,
            thumbnail,
            description,
            channel_id,
            channel_url,
            channel,
            duration,
            view_count,
            webpage_url,
            id,
            timestamp,
            upload_date,
        } as VideoType));
};

export const getVideoInfos = (seriesName: string, url: string): Video[] => {
    execSync(
        getAllVideoInfoCommand(seriesName, url),
        { encoding: Constants.FILES.ENCODING }
    );

    return processVideoInfos(seriesName);
};

export const downloadVideos = (videos: ActionableVideo[]): string[] => {
    const { youtube: { cookieFile, sponsorBlockEnabled }, preview, verbose } = config();

    const summaries: string[] = [];
    for (const video of videos) {
        if (!video.sonarrEpisode) {
            throw new Error('sonarrEpisode episode not found This shouldn\'t happen!');
        }
        if (!video.youtubeVideo) {
            throw new Error('youtubeVideo episode not found This shouldn\'t happen!');
        }
        const {
            series: { title: seriesTitle }
        } = video.sonarrEpisode;
        const youtubeURL = `${Constants.YOUTUBE.HOST}/watch?v=${video.youtubeVideo.id}/`;
        const format = 'mkv';

        const fileName = video.outputFilename();
        const seasonDirectory = video.outputSeasonDirectory();
        const outputCachePath = join(cacheKeyBase(join(seriesTitle, 'tmp')), seasonDirectory);
        const outputCacheFilePath = join(outputCachePath, fileName);
        const alreadyDownloaded = existsSync(`${seasonDirectory}/${fileName}.${format}`);
        if (alreadyDownloaded) {
            continue;
        }

        let summaryText = `Downloading ${youtubeURL} to "${seasonDirectory}/${fileName}.%(ext)s"`;
        if (preview) {
            summaryText = `Preview mode on, would have ${summaryText}`;
            summaries.push(summaryText);
            continue;
        }

        log(summaryText);

        mkdirSync(outputCachePath, { recursive: true });
        execSync(
            [
                ytdlp_path,
                '--add-metadata',
                '--no-write-playlist-metafiles',
                '--write-auto-sub',
                `--cookies "${cookieFile}"`,
                '--convert-subs=srt',
                '--sub-lang "en"',
                '--ignore-no-formats-error',
                `--cache-dir ${cacheKeyBase('.cache')}`,
                `--datebefore ${getYoutubeDelayString()}`,
                sponsorBlockEnabled ? '--sponsorblock-remove "default"' : '',
                `--merge-output-format ${format}`,
                ` -o "${outputCacheFilePath}.%(ext)s"`,
                youtubeURL
            ].join(' '),
            verbose ? { stdio: 'inherit' } : {}
        );
        mkdirSync(seasonDirectory, { recursive: true });
        readdirSync(outputCachePath).forEach(file => {
            const regexFilename = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (new RegExp(`.*${regexFilename}.*`).test(file)) {
                const sourceFile = path.join(outputCachePath, file);
                const targetFile = path.join(seasonDirectory, file);
                copyFileSync(sourceFile, targetFile);
            }
        });

        rmSync(outputCachePath, { recursive: true });
        summaries.push(`${summaryText}\n${video.summary()}`);
    }

    return summaries;
};