import { readdirSync, unlinkSync, writeFileSync } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { btoa } from 'buffer';

import { atou, btou, config, isBase64Encoded } from '@sonarrTube/helpers/Config';
import { Constants } from '@sonarrTube/types/config/Constants';
import { Environment } from '@sonarrTube/types/config/Environment';
import { mockConfig, resetConfig } from '@sonarrTube/mocks/Config';

describe('#config', () => {
    const configValues = {
        TVDB_USERNAME: 'username',
        TVDB_PASSWORD: 'password',
        TVDB_EMAIL: 'email',
        TVDB_API: 'api',
        YOUTUBE_COOKIE_FILE: 'cookie',
        YOUTUBE_ENABLE_SPONSORBLOCK: 'true',
        YOUTUBE_DOWNLOAD_DELAY_MONTHS: '1',
        SONARR_API: 'sonarr_api',
        SONARR_HOST: 'sonarr_host',
        CACHE_DIR: '/path/to/cache',
        PREVIEW_ONLY: 'true',
        OUTPUT_DIR: '/path/to/output',
        VERBOSE_LOGS: 'false',
        DOWNLOAD_ONLY: 'true',
        TITLE_CLEANER_REGEX: '.*|some|(a|b|c)',
        SKIP_FROM_SYNC_TVDB_SERIES_IDS: '1,2,3',
        SKIP_FROM_SYNC_TVDB_EPISODES_IDS: '4,5,6',
        ONLY_SYNC_TVDB_SERIES_IDS: '7,8,9',
        FORCE_CLEAR_CACHE: 'true',
        NOTIFICATION_WEBHOOK: 'webhook',
        RE_RUN_INTERVAL: '10',
        IS_DOCKER: 'true',
    } as Environment;

    beforeEach(() => {
        mockConfig().mockRestore();
        resetConfig();
    });

    afterAll(() => {
        const tmpDir = 'tmp';
        const files = readdirSync(tmpDir);

        // Filter .env and .sh files
        const filesToDelete = files.filter(file => file.endsWith('.env'));

        // Delete the filtered files
        filesToDelete.forEach(file => {
            const filePath = path.join(tmpDir, file);
            unlinkSync(filePath);
        });
    });

    describe('with caching', () => {
        let setCachedConfigSpy: jest.SpyInstance;
        beforeEach(() => {
            setCachedConfigSpy = jest.spyOn(
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                require('@sonarrTube/helpers/Config'),
                'setCachedConfig'
            );
        });
        it('should set cache only once', () => {
            setCachedConfigSpy.mockClear();
            config();
            expect(setCachedConfigSpy).toHaveBeenCalledTimes(1);
            setCachedConfigSpy.mockClear();
            config();
            expect(setCachedConfigSpy).toHaveBeenCalledTimes(0);
        });
    });

    describe('with no env file', () => {
        beforeEach(() => {
            process.env.IS_DOCKER = 'true';
        });
        it('should initialize config', () => {
            expect(config()).toEqual({
                titleCleanerRegex: new RegExp(Constants.ENVIRONMENT.TITLE_CLEANER_REGEX),
                notificationWebhook: undefined,
                reRunInterval: Constants.RE_RUN_INTERVAL * Constants.RE_RUN_INTERVAL_MULTIPLIER,
                cacheDir: Constants.ENVIRONMENT.CACHE_DIR,
                verbose: false,
                downloadOnly: true,
                isDocker: true,
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
        const envFile = `./tmp/.${randomUUID()}.env`;

        beforeAll(() => {
            writeFileSync(envFile, [
                `TVDB_USERNAME=${configValues.TVDB_USERNAME}`,
                `TVDB_PASSWORD=${configValues.TVDB_PASSWORD}`,
                `TVDB_EMAIL=${configValues.TVDB_EMAIL}`,
                `TVDB_API=${configValues.TVDB_API}`,
                `YOUTUBE_COOKIE_FILE=${configValues.YOUTUBE_COOKIE_FILE}`,
                `YOUTUBE_ENABLE_SPONSORBLOCK=${configValues.YOUTUBE_ENABLE_SPONSORBLOCK}`,
                `YOUTUBE_DOWNLOAD_DELAY_MONTHS=${configValues.YOUTUBE_DOWNLOAD_DELAY_MONTHS}`,
                `SONARR_API=${configValues.SONARR_API}`,
                `SONARR_HOST=${configValues.SONARR_HOST}`,
                `CACHE_DIR=${configValues.CACHE_DIR}`,
                `PREVIEW_ONLY=${configValues.PREVIEW_ONLY}`,
                `OUTPUT_DIR=${configValues.OUTPUT_DIR}`,
                `VERBOSE_LOGS=${configValues.VERBOSE_LOGS}`,
                `DOWNLOAD_ONLY=${configValues.DOWNLOAD_ONLY}`,
                `IS_DOCKER=${configValues.IS_DOCKER}`,
                `TITLE_CLEANER_REGEX=${configValues.TITLE_CLEANER_REGEX}`,
                `SKIP_FROM_SYNC_TVDB_SERIES_IDS=${configValues.SKIP_FROM_SYNC_TVDB_SERIES_IDS}`,
                `SKIP_FROM_SYNC_TVDB_EPISODES_IDS=${configValues.SKIP_FROM_SYNC_TVDB_EPISODES_IDS}`,
                `ONLY_SYNC_TVDB_SERIES_IDS=${configValues.ONLY_SYNC_TVDB_SERIES_IDS}`,
                `FORCE_CLEAR_CACHE=${configValues.FORCE_CLEAR_CACHE}`,
                `NOTIFICATION_WEBHOOK=${configValues.NOTIFICATION_WEBHOOK}`,
                `RE_RUN_INTERVAL=${configValues.RE_RUN_INTERVAL}`,
            ].join('\n'));
        });

        beforeEach(() => {
            Constants.ENVIRONMENT.ENV_FILE = envFile;
        });

        it('should initialize config', () => {
            expect(config()).toEqual({
                titleCleanerRegex: new RegExp(configValues.TITLE_CLEANER_REGEX),
                notificationWebhook: configValues.NOTIFICATION_WEBHOOK,
                reRunInterval: 10 * Constants.RE_RUN_INTERVAL_MULTIPLIER,
                cacheDir: configValues.CACHE_DIR,
                verbose: false,
                downloadOnly: true,
                isDocker: true,
                preview: true,
                tvdb: {
                    username: configValues.TVDB_USERNAME,
                    password: configValues.TVDB_PASSWORD,
                    email: configValues.TVDB_EMAIL,
                    apiKey: configValues.TVDB_API,
                    skipSeriesIds: [1, 2, 3],
                    skippedEpisodeIds: [4, 5, 6],
                    matchSeriesIds: [7, 8, 9]
                },
                youtube: {
                    cookieFile: configValues.YOUTUBE_COOKIE_FILE,
                    sponsorBlockEnabled: true,
                    downloadDelayMonths: 1,
                },
                sonarr: {
                    apiKey: configValues.SONARR_API,
                    host: configValues.SONARR_HOST
                }
            });
        });
    });

    describe('testing complex encoded regex', () => {
        const envFile = `./tmp/.${randomUUID()}.env`;

        beforeAll(() => {
            Constants.ENVIRONMENT.ENV_FILE = envFile;
            writeFileSync(envFile, [
                // eslint-disable-next-line max-len
                'TITLE_CLEANER_REGEX=ICooLXxfKSogKihUUk98XCgqRG9jdW1lbnRhcnlcKSp8U21hcnRlciBFdmVyeSBEYXkgKFswLTldKSt8IyhzfFMpK2hvcnRzfChBZGFtIFNhdmFnZSgnfOKAmSkqcyopKiAqKChPbmUgRGF5fExpdmV8V2Vla2VuZCkqICooQnVpbGR8UmVwYWlyKSopK3MqICooLXxffDopKiAqfENvbXB1dGVycGhpbGV8R3VnYSBGb29kc3xSZWFsIFN0b3JpZXN8QXJzIFRlY2hpbmNhfFdhciBTdG9yaWVzfEJhdHRsZXpvbmV8RG9vbXNkYXl8UEJTIERpZ2l0YWwgU3R1ZGlvc3xTcGFjZSBUaW1lfFxbNGtcXXxbXlx4MDAtXHg3Rl18TnVjbGVhciBUaHJvbmUgKihbMC05XSkqKQ==',
            ].join('\n'));
        });

        beforeEach(() => {
            Constants.ENVIRONMENT.ENV_FILE = envFile;
        });

        it('should initialize config', () => {
            expect(config().titleCleanerRegex).toEqual(
                // eslint-disable-next-line no-control-regex, max-len
                new RegExp(/ *(-|_)* *(TRO|\(*Documentary\)*|Smarter Every Day ([0-9])+|#(s|S)+horts|(Adam Savage('|’)*s*)* *((One Day|Live|Weekend)* *(Build|Repair)*)+s* *(-|_|:)* *|Computerphile|Guga Foods|Real Stories|Ars Techinca|War Stories|Battlezone|Doomsday|PBS Digital Studios|Space Time|\[4k\]|[^\x00-\x7F]|Nuclear Throne *([0-9])*)/)
            );
        });
    });
});

describe('testing base64 funcs', () => {
    describe('When simple', () => {
        const testString = 'asdomtewhfhsadfbjsdpfdsnjusndf';
        const testResult = 'YXNkb210ZXdoZmhzYWRmYmpzZHBmZHNuanVzbmRm';
        it('should convert a simple string to base64', () => {
            const result = btou(testString);
            expect(isBase64Encoded(result)).toEqual(true);
            expect(result).toEqual(testResult);
        });
        it('should decode a simple string to base64', () => {
            expect(atou(testResult)).toEqual(testString);
        });
    });

    describe('When complex (requires encoding)', () => {
        // eslint-disable-next-line max-len, quotes
        const testString = " *(-|_)* *(TRO|\\(*Documentary\\)*|Smarter Every Day ([0-9])+|#(s|S)+horts|(Adam Savage('|’)*s*)* *((One Day|Live|Weekend)* *(Build|Repair)*)+s* *(-|_|:)* *|Computerphile|Guga Foods|Real Stories|Ars Techinca|War Stories|Battlezone|Doomsday|PBS Digital Studios|Space Time|\\[4k\\]|[^\\x00-\\x7F]|Nuclear Throne *([0-9])*)";
        // eslint-disable-next-line max-len
        const testResult = 'ICooLXxfKSogKihUUk98XCgqRG9jdW1lbnRhcnlcKSp8U21hcnRlciBFdmVyeSBEYXkgKFswLTldKSt8IyhzfFMpK2hvcnRzfChBZGFtIFNhdmFnZSgnfOKAmSkqcyopKiAqKChPbmUgRGF5fExpdmV8V2Vla2VuZCkqICooQnVpbGR8UmVwYWlyKSopK3MqICooLXxffDopKiAqfENvbXB1dGVycGhpbGV8R3VnYSBGb29kc3xSZWFsIFN0b3JpZXN8QXJzIFRlY2hpbmNhfFdhciBTdG9yaWVzfEJhdHRsZXpvbmV8RG9vbXNkYXl8UEJTIERpZ2l0YWwgU3R1ZGlvc3xTcGFjZSBUaW1lfFxbNGtcXXxbXlx4MDAtXHg3Rl18TnVjbGVhciBUaHJvbmUgKihbMC05XSkqKQ==';
        it('should convert a simple string to base64', () => {
            const result = btou(testString);
            expect(isBase64Encoded(result)).toEqual(true);
            expect(result).toEqual(testResult);
        });
        it('should decode a simple string to base64', () => {
            expect(atou(testResult)).toEqual(testString);
        });
    });

});
describe('#isBase64Encoded', () => {
    const testString = 'asdomtewhfhsadfbjsdpfdsnjusndf';
    it('should be true', () => {
        const result = btoa(testString);
        expect(isBase64Encoded(result)).toEqual(true);
    });
    it('should be false', () => {
        expect(isBase64Encoded(testString)).toEqual(false);
    });
});
