import { readdirSync, readFileSync, renameSync } from 'fs';
import { execSync } from 'child_process';
import { cachePath } from '../helpers/Cache.js';
import path from 'path';
import { config } from '../helpers/Config.js';
import { log } from '../helpers/Log.js';
import { Video } from '../models/api/youtube/Video.js';
import { ActionableVideo } from '../models/api/ActionableVideo.js';

const { youtube: { cookieFile }, outputDir, preview, verbose } = config();

const cacheKeyBase = (cacheKey: string): string => cachePath(`youtube/${cacheKey}`);
const getAllVideoInfoCommand = (cacheKey: string, url: string): string => {
    const cacheBase = cacheKeyBase(cacheKey);

    return [
        'yt-dlp',
        '--write-info-json',
        '--skip-download',
        '--force-write-archive',
        `--cache-dir ${cachePath(cacheKeyBase('.cache'))}`,
        `--download-archive "${cacheBase}/videos.txt"`,
        '--match-filter \'duration>120 & availability!=private & availability!=premium_only & ' +
        'availability!=subscriber_only & availability!=needs_auth\'',
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

export const getChannelVideoInfos = (seriesName: string, channelID: string): Video[] | null => {
    if (!channelID) {
        return null;
    }
    execSync(
        getAllVideoInfoCommand(seriesName, 'https://www.youtube.com/channel/${channelID}/videos'),
        { encoding: 'utf8' }
    );

    return processVideoInfos(channelID);
};

export const getVideoInfos = (seriesName: string, playlistURL: string): Video[] | null => {
    if (!playlistURL) {
        return null;
    }

    execSync(
        getAllVideoInfoCommand(seriesName, playlistURL),
        { encoding: 'utf8' }
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
            `https://www.youtube.com/${alias}/`
        ].join(' '),
        { encoding: 'utf8' }
    );
};

export const downloadVideos = (videos: ActionableVideo[]): void => {

    for (const { sonarrEpisode, youtubeVideo } of videos) {
        const {
            seasonNumber,
            episodeNumber,
            series: { title: seriesTitle, path: seriesPath }
        } = sonarrEpisode;
        const fileName = `${seriesTitle}.s${seasonNumber}e${episodeNumber}`;
        const subPath = `Season ${seasonNumber}`;
        const outputCachePath = `${cacheKeyBase(`${seriesTitle}/tmp`)}/${subPath}`;
        const outputCacheFilePath = `${outputCachePath}/${fileName}`;
        const outputPath = `${outputDir}/${seriesPath}/${subPath}`;
        if (preview) {
            log(`Preview mode on, would have downloaded https://www.youtube.com/watch?v=${youtubeVideo.id}/ to` +
                ` "${outputPath}/${fileName}.%(ext)s"`
            );

            continue;
        }
        log(
            `Downloading https://www.youtube.com/watch?v=${youtubeVideo.id}/ to` +
            ` "${outputPath}/${fileName}.%(ext)s"`
        );
        execSync(
            [
                'yt-dlp',
                // '-f "bv*[ext=mp4]+ba[ext=m4a]"',
                '--write-thumbnail',
                '--add-metadata',
                '--no-write-playlist-metafiles',
                '--write-auto-sub',
                `--cookies "${cookieFile}"`,
                '--convert-subs=srt',
                '--sub-lang "en"',
                '--ignore-no-formats-error',
                // '--no-progress',
                `--cache-dir ${cachePath(cacheKeyBase('.cache'))}`,
                //  TODO: do we want to support this? gives time for sponsorblock entries
                // '--datebefore $oneMonthAgo',
                '--sponsorblock-remove "default"',
                '--merge-output-format mkv',
                ` -o "${outputCacheFilePath}.%(ext)s"`,
                `https://www.youtube.com/watch?v=${youtubeVideo.id}/`
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