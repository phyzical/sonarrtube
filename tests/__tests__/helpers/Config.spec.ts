import { writeFileSync } from 'fs';

import { config } from '@sonarrTube/helpers/Config.js';

describe('config', () => {
    describe('with no env file', () => {
        jest.mock('dotenv', () => ({
            config: jest.fn().mockImplementation(() => {
            }),
        }));

        it('should initialize config', () => {
            expect(config()).toEqual({
                titleCleanerRegex: new RegExp('.*'),
                notificationWebhook: undefined,
                reRunInterval: 60000,
                cacheDir: '/path/to/cache',
                outputDir: '/path/to/output',
                verbose: false,
                downloadOnly: true,
                preview: true,
                tvdb: {
                    username: undefined,
                    password: undefined,
                    email: undefined,
                    apiKey: undefined,
                    skipSeriesIds: [],
                    skippedEpisodeIds: [],
                    matchSeriesIds: []
                },
                youtube: {
                    cookieFile: undefined,
                    sponsorBlockEnabled: true,
                    downloadDelayMonths: 0,
                },
                sonarr: {
                    apiKey: undefined,
                    host: undefined
                }
            });
        });
    });

    describe('with env file', () => {
        beforeAll(() => {
            const configContents = '';
            writeFileSync('./tmp/.env.test', configContents);
        });
        jest.mock('dotenv', () => ({
            config: jest.fn().mockImplementation(() => {
            }),
        }));

        it('should initialize config', async () => {
            expect(config()).toEqual({
                titleCleanerRegex: new RegExp('.*'),
                notificationWebhook: undefined,
                reRunInterval: 60000,
                cacheDir: '/path/to/cache',
                outputDir: '/path/to/output',
                verbose: false,
                downloadOnly: true,
                preview: true,
                tvdb: {
                    username: undefined,
                    password: undefined,
                    email: undefined,
                    apiKey: undefined,
                    skipSeriesIds: [],
                    skippedEpisodeIds: [],
                    matchSeriesIds: []
                },
                youtube: {
                    cookieFile: undefined,
                    sponsorBlockEnabled: true,
                    downloadDelayMonths: 0,
                },
                sonarr: {
                    apiKey: undefined,
                    host: undefined
                }
            });
        });
    });

    describe('with environmental vars', () => {
        jest.mock('dotenv', () => ({
            config: jest.fn().mockImplementation(() => {
            }),
        }));

        it('should initialize config', async () => {
            expect(config()).toEqual({
                titleCleanerRegex: new RegExp('.*'),
                notificationWebhook: undefined,
                reRunInterval: 60000,
                cacheDir: '/path/to/cache',
                outputDir: '/path/to/output',
                verbose: false,
                downloadOnly: true,
                preview: true,
                tvdb: {
                    username: undefined,
                    password: undefined,
                    email: undefined,
                    apiKey: undefined,
                    skipSeriesIds: [],
                    skippedEpisodeIds: [],
                    matchSeriesIds: []
                },
                youtube: {
                    cookieFile: undefined,
                    sponsorBlockEnabled: true,
                    downloadDelayMonths: 0,
                },
                sonarr: {
                    apiKey: undefined,
                    host: undefined
                }
            });
        });
    });
});