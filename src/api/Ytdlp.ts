import { readdirSync, readFileSync, renameSync } from 'fs';
import { execSync } from 'child_process';
import { cachePath } from '../helpers/Cache.js';
import path from 'path';
import { config } from '../helpers/Config.js';
import { log } from '../helpers/Log.js';
import { Video } from '../models/api/youtube/Video.js';
import { ActionableVideo } from '../models/api/ActionableVideo.js';
import { getYoutubeDelayString } from '../helpers/Generic.js';
import { Constants } from '../types/config/Constants.js';

const { youtube: { cookieFile, sponsorBlockEnabled }, outputDir, preview, verbose } = config();

const cacheKeyBase = (cacheKey: string): string => cachePath(`youtube/${cacheKey}`);
const getAllVideoInfoCommand = (cacheKey: string, url: string): string => {
    const cacheBase = cacheKeyBase(cacheKey);

    return [
        'yt-dlp',
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

    return files.map(file => {
        if (!file.match(/.*json.*/)) {
            return;
        }
        const videoInfo = JSON.parse(
            readFileSync(path.join(cachePath, file)).toString()
        );

        if (videoInfo._type != 'video') {
            return;
        }

        return new Video({
            title: videoInfo.title,
            fulltitle: videoInfo.fulltitle,
            thumbnail: videoInfo.thumbnail,
            description: videoInfo.description,
            channel_id: videoInfo.channel_id,
            channel_url: videoInfo.channel_url,
            channel: videoInfo.channel,
            duration: videoInfo.duration,
            view_count: videoInfo.view_count,
            webpage_url: videoInfo.webpage_url,
            id: videoInfo.id,
            timestamp: videoInfo.timestamp,
            upload_date: videoInfo.upload_date,
        });
    }).filter(Boolean);
};

export const getVideoInfos = (seriesName: string, url: string): Video[] | null => {
    if (!url) {
        return null;
    }

    execSync(
        getAllVideoInfoCommand(seriesName, url),
        { encoding: Constants.FILES.ENCODING }
    );

    return processVideoInfos(seriesName);
};

export const channelIdByAlias = (alias: string): string => {
    if (!alias) {
        return null;
    }

    return execSync(
        [
            'yt-dlp',
            '-print "%(channel_id)s"',
            '--playlist-end 1',
            `${Constants.YOUTUBE.HOST}/${alias}/`
        ].join(' '),
        { encoding: Constants.FILES.ENCODING }
    );
};

export const downloadVideos = (videos: ActionableVideo[]): void => {

    for (const { sonarrEpisode, youtubeVideo } of videos) {
        const {
            seasonNumber,
            episodeNumber,
            series: { title: seriesTitle, path: seriesPath }
        } = sonarrEpisode;
        const youtubeURL = `${Constants.YOUTUBE.HOST}/watch?v=${youtubeVideo.id}/`;
        const fileName = `${seriesTitle}.s${seasonNumber}e${episodeNumber}`;
        const subPath = `Season ${seasonNumber}`;
        const outputCachePath = `${cacheKeyBase(`${seriesTitle}/tmp`)}/${subPath}`;
        const outputCacheFilePath = `${outputCachePath}/${fileName}`;
        const outputPath = `${outputDir}/${seriesPath}/${subPath}`;
        if (preview) {
            log(`Preview mode on, would have downloaded ${youtubeURL} to` +
                ` "${outputPath}/${fileName}.%(ext)s"`
            );

            continue;
        }
        log(
            `Downloading ${youtubeURL} to "${outputPath}/${fileName}.%(ext)s"`
        );

        execSync(
            [
                'yt-dlp',
                '--write-thumbnail',
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
                '--merge-output-format mkv',
                ` -o "${outputCacheFilePath}.%(ext)s"`,
                youtubeURL
            ].join(' '),
            verbose ? { stdio: 'inherit' } : {}
        );
        readdirSync(outputCachePath).forEach(file => {
            const regexFilename = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (new RegExp(`.*${regexFilename}.*`).test(file)) {
                const sourceFile = path.join(outputCachePath, file);
                const targetFile = path.join(outputPath, file);
                renameSync(sourceFile, targetFile);
            }
        });

    }
};