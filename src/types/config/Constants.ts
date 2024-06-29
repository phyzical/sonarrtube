export const Constants = {
    REQUESTS: {
        GET: 'GET',
        POST: 'POST',
    },
    FILES: {
        ENCODING: 'utf8' as BufferEncoding,
    },
    ENVIRONMENT: {
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
        MAX_ATTEMPTS: 4,
        MINIMUM_WIDTH: 640,
        MINIMUM_HEIGHT: 360,
        TEXT: {
            LANGUAGE: 'eng',
            FINDER_CHAR_LIST: ' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz?!\'"`',
            FONT_SIZE: 45,
            LENGTH: 4,
            DIRECTION: 'LEFT_TO_RIGHT'
        }
    },
    CACHE_FOLDERS: {
        THUMBNAIL: 'thumbnail',
        TVDB: 'tvdb',
        YOUTUBE: 'youtube',
        TESS: 'tesseract',
        SCREENSHOTS: 'screenshots'
    },
    CHAR_CLEANER_LIST: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖŠÚÛÜÙÝŸŽ',
    EXTENSIONS: {
        PNG: '.png',
        WEBP: '.webp'
    }
};