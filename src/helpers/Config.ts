import dotenv from 'dotenv';
import { Config } from '../types/config/Config.js';
import { Environment } from '../types/config/Environment.js';
import { rmdirSync } from 'fs';
import { Constants } from '../types/config/Constants.js';

let cachedConfig: Config = null;

export const config = (): Config => {
    if (cachedConfig) {
        return cachedConfig;
    }

    const envFile = process.env.ENV_FILE || Constants.ENVIRONMENT.ENV_FILE;

    dotenv.config({ path: envFile });

    const {
        TVDB_USERNAME,
        TVDB_PASSWORD,
        TVDB_EMAIL,
        TVDB_API,
        YOUTUBE_COOKIE_FILE,
        YOUTUBE_ENABLE_SPONSORBLOCK,
        YOUTUBE_DOWNLOAD_DELAY_MONTHS,
        SONARR_API,
        SONARR_HOST,
        CACHE_DIR,
        PREVIEW_ONLY,
        OUTPUT_DIR,
        VERBOSE_LOGS,
        DOWNLOAD_ONLY,
        TITLE_CLEANER_REGEX,
        SKIP_FROM_SYNC_TVDB_SERIES_IDS,
        SKIP_FROM_SYNC_TVDB_EPISODES_IDS,
        ONLY_SYNC_TVDB_SERIES_IDS,
        FORCE_CLEAR_CACHE,
        NOTIFICATION_WEBHOOK
    } = process.env as unknown as Environment;


    const cacheDir = CACHE_DIR || Constants.ENVIRONMENT.CACHE_DIR;

    if (FORCE_CLEAR_CACHE == 'true') {
        rmdirSync(cacheDir, { recursive: true });
    }

    cachedConfig = {
        titleCleanerRegex: new RegExp(TITLE_CLEANER_REGEX || Constants.ENVIRONMENT.TITLE_CLEANER_REGEX),
        notificationWebhook: NOTIFICATION_WEBHOOK,
        cacheDir,
        outputDir: OUTPUT_DIR || Constants.ENVIRONMENT.OUTPUT_DIR,
        verbose: VERBOSE_LOGS == 'true',
        downloadOnly: DOWNLOAD_ONLY == '' || DOWNLOAD_ONLY == 'true',
        preview: PREVIEW_ONLY == '' || PREVIEW_ONLY == 'true',
        tvdb: {
            username: TVDB_USERNAME,
            password: TVDB_PASSWORD,
            email: TVDB_EMAIL,
            apiKey: TVDB_API,
            skipSeriesIds: SKIP_FROM_SYNC_TVDB_SERIES_IDS.split(','),
            skippedEpisodeIds: SKIP_FROM_SYNC_TVDB_EPISODES_IDS.split(','),
            matchSeriesIds: ONLY_SYNC_TVDB_SERIES_IDS.split(',')
        },
        youtube: {
            cookieFile: YOUTUBE_COOKIE_FILE,
            sponsorBlockEnabled: YOUTUBE_ENABLE_SPONSORBLOCK == '' || YOUTUBE_ENABLE_SPONSORBLOCK == 'true',
            downloadDelayMonths: (YOUTUBE_DOWNLOAD_DELAY_MONTHS && parseInt(YOUTUBE_DOWNLOAD_DELAY_MONTHS)) || 0,
        },
        sonarr: {
            apiKey: SONARR_API,
            host: SONARR_HOST
        }
    };

    return cachedConfig;
};