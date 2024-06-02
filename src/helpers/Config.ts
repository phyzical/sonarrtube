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
        YOUTUBE_API,
        SONARR_API,
        SONARR_HOST
    } = process.env as unknown as Environment;

    return {
        tvdb: {
            username: TVDB_USERNAME,
            password: TVDB_PASSWORD,
            email: TVDB_EMAIL,
            apiKey: TVDB_API
        },
        youtube: {
            apiKey: YOUTUBE_API
        },
        sonarr: {
            apiKey: SONARR_API,
            host: SONARR_HOST
        }
    };
};