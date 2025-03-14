export const Constants = {
    SEPARATOR: '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    RE_RUN_INTERVAL: 1440,
    RE_RUN_INTERVAL_MULTIPLIER: 60000,
    REQUESTS: {
        GET: 'GET',
        POST: 'POST',
    },
    FILES: {
        ENCODING: 'utf8' as BufferEncoding,
    },
    ENVIRONMENT: {
        ENV_FILE: '.envs',
        CACHE_DIR: './cache',
        TITLE_CLEANER_REGEX: 'SomeRandomRegexTextThatShouldntMatchAnything',
        OUTPUT_DIR: './downloads'
    },
    YOUTUBE: {
        HOST: 'https://www.youtube.com',
        VIDEO_REMOVED_FLAG: 'THIS_WAS_REMOVED',
    },
    SONARR: {
        SERIES_ENDPOINT: 'api/v3/series',
        EPISODE_BY_SERIES_ENDPOINT: 'api/v3/episode?seriesId=',
        HEADERS: {
            'accept': 'application/json,text/json',
            'content-type': 'application/json',
        }
    },
    TVDB: {
        API_HOST: 'https://api4.thetvdb.com/v4',
        HOST: 'https://www.thetvdb.com',
        HEADERS: {
            'accept': 'application/json,text/json',
            'content-type': 'application/json',
        },
        SERIES_ENDPOINT: 'series',
        EPISODES_ENDPOINT: 'episodes',
        LOGIN_ENDPOINT: 'login',
    },
    THUMBNAIL: {
        FAILED_TEXT: 'FAILED',
        MAX_ATTEMPTS: 3,
        MINIMUM_WIDTH: 640,
        MINIMUM_HEIGHT: 360,
        TEXT: {
            LANGUAGE: 'eng',
            FINDER_CHAR_LIST: ' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz?!\'"`',
            CONFIDENCE: 80
        }
    },
    CACHE_FOLDERS: {
        THUMBNAIL: 'thumbnail',
        TVDB: 'tvdb',
        YOUTUBE: 'youtube',
        TESS: 'tesseract'
    },
    CHAR_CLEANER_LIST: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖŠÚÛÜÙÝŸŽ',
    EXTENSIONS: {
        PNG: 'png',
        WEBP: 'webp'
    }
};