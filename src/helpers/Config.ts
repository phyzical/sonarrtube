import dotenv from 'dotenv';
import { Config } from '../types/config/Config.js';
import { Environment } from '../types/config/Environment.js';

export const config = (): Config => {
    dotenv.config();

    const {
        TVDB_USERNAME,
        TVDB_PASSWORD,
        TVDB_EMAIL,
        TVDB_API,
        YOUTUBE_COOKIE_FILE,
        SONARR_API,
        SONARR_HOST,
        CACHE_DIR,
        PREVIEW_ONLY,
        OUTPUT_DIR,
        VERBOSE_LOGS,
        DOWNLOAD_ONLY,
        TITLE_CLEANER_REGEX,
        SKIP_FROM_SYNC_TVDB_SERIES_IDS
    } = process.env as unknown as Environment;

    return {
        titleCleanerRegex: new RegExp(TITLE_CLEANER_REGEX || 'SomeRandomRegexTextThatShouldntMatchAnything'),
        cacheDir: CACHE_DIR || './cache',
        outputDir: OUTPUT_DIR || './downloads',
        verbose: VERBOSE_LOGS == 'true',
        downloadOnly: DOWNLOAD_ONLY == 'true',
        preview: PREVIEW_ONLY == 'true',
        tvdb: {
            username: TVDB_USERNAME,
            password: TVDB_PASSWORD,
            email: TVDB_EMAIL,
            apiKey: TVDB_API,
            skippedIds: SKIP_FROM_SYNC_TVDB_SERIES_IDS.split(',')
        },
        youtube: {
            cookieFile: YOUTUBE_COOKIE_FILE,
        },
        sonarr: {
            apiKey: SONARR_API,
            host: SONARR_HOST
        }
    };
};