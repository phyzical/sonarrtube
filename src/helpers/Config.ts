import { atob, btoa } from 'buffer';

import dotenv from 'dotenv';

import { Environment } from '@sonarrTube/types/config/Environment.js';
import { Constants } from '@sonarrTube/types/config/Constants.js';
import { resetCache } from '@sonarrTube/helpers/Cache.js';
import { Config } from '@sonarrTube/types/config/Config.js';

global.cachedConfig = {} as Config;

export const getCachedConfig = (): Config => global.cachedConfig;
export const setCachedConfig = (config: Config): Config => global.cachedConfig = config;

// TODO add docs around encoding correctly
export const btou = (string: string): string => btoa(unescape(encodeURIComponent(string)));
export const atou = (encodedString: string): string => decodeURIComponent(escape(atob(encodedString)));
export const isBase64Encoded = (str: string): boolean => {
    if (typeof str !== 'string') {
        return false;
    }
    // eslint-disable-next-line no-useless-escape
    const base64Regex = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;

    return base64Regex.test(str);
};

const processRegex = (regex: string): RegExp => {
    let regexToBeProcessed = regex || Constants.ENVIRONMENT.TITLE_CLEANER_REGEX;
    if (isBase64Encoded(regex)) {
        regexToBeProcessed = atou(regex);
    }

    return new RegExp(regexToBeProcessed);
};

export const config = (): Config => {
    const cachedConfig = getCachedConfig();
    if (cachedConfig && Object.keys(cachedConfig).length > 0) {
        return cachedConfig;
    }

    const envFile = process.env.ENV_FILE || Constants.ENVIRONMENT.ENV_FILE;

    if (envFile?.length > 0) {
        dotenv.config({ path: envFile });
    }

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
        NOTIFICATION_WEBHOOK,
        RE_RUN_INTERVAL,
    } = process.env as unknown as Environment;

    const cacheDir = CACHE_DIR || Constants.ENVIRONMENT.CACHE_DIR;

    if (FORCE_CLEAR_CACHE == 'true') {
        resetCache(cacheDir);
    }

    return setCachedConfig({
        titleCleanerRegex: processRegex(TITLE_CLEANER_REGEX),
        notificationWebhook: NOTIFICATION_WEBHOOK,
        reRunInterval: (parseInt(RE_RUN_INTERVAL) || Constants.RE_RUN_INTERVAL) * Constants.RE_RUN_INTERVAL_MULTIPLIER,
        cacheDir,
        outputDir: OUTPUT_DIR || Constants.ENVIRONMENT.OUTPUT_DIR,
        verbose: VERBOSE_LOGS == 'true',
        downloadOnly: DOWNLOAD_ONLY == undefined || DOWNLOAD_ONLY == '' || DOWNLOAD_ONLY.toLowerCase() == 'true',
        preview: PREVIEW_ONLY == undefined || PREVIEW_ONLY == '' || PREVIEW_ONLY.toLowerCase() == 'true',
        tvdb: {
            username: TVDB_USERNAME,
            password: TVDB_PASSWORD,
            email: TVDB_EMAIL,
            apiKey: TVDB_API,
            skipSeriesIds: (SKIP_FROM_SYNC_TVDB_SERIES_IDS || '')
                .split(',')
                .filter(Boolean)
                .map(x => parseInt(x)),
            skippedEpisodeIds: (SKIP_FROM_SYNC_TVDB_EPISODES_IDS || '')
                .split(',')
                .filter(Boolean)
                .map(x => parseInt(x)),
            matchSeriesIds: (ONLY_SYNC_TVDB_SERIES_IDS || '')
                .split(',')
                .filter(Boolean)
                .map(x => parseInt(x))
        },
        youtube: {
            cookieFile: YOUTUBE_COOKIE_FILE,
            sponsorBlockEnabled: YOUTUBE_ENABLE_SPONSORBLOCK == undefined ||
                YOUTUBE_ENABLE_SPONSORBLOCK == '' ||
                YOUTUBE_ENABLE_SPONSORBLOCK.toLowerCase() == 'true',
            downloadDelayMonths: (YOUTUBE_DOWNLOAD_DELAY_MONTHS && parseInt(YOUTUBE_DOWNLOAD_DELAY_MONTHS)) || 0,
        },
        sonarr: {
            apiKey: SONARR_API,
            host: SONARR_HOST
        }
    });
};
