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
        VERBOSE_LOGS
    } = process.env as unknown as Environment;

    return {
        cacheDir: CACHE_DIR || './cache',
        outputDir: OUTPUT_DIR || './downloads',
        verbose: VERBOSE_LOGS == 'true',
        preview: PREVIEW_ONLY == 'true',
        tvdb: {
            username: TVDB_USERNAME,
            password: TVDB_PASSWORD,
            email: TVDB_EMAIL,
            apiKey: TVDB_API
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