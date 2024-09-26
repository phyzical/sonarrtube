import { seriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
import { faker } from '@faker-js/faker';

import { Series } from '@sonarrTube/models/api/sonarr/Series';
import { Constants } from '@sonarrTube/types/config/Constants';

describe('Series', () => {
    describe('constructor', () => {
        it('should create an instance of Episode', () => {
            const series = seriesFactory();
            expect(series).toBeInstanceOf(Series);
        });

        it('replaces root folder correctly', () => {
            const rootFolderPath = faker.system.directoryPath();
            const path = `${rootFolderPath}/${faker.system.filePath()}`;
            const series = seriesFactory({
                path,
                rootFolderPath
            });
            expect(series.path).not.toContain(rootFolderPath);
        });
    });

    describe('tvdbCacheKey', () => {
        it('returns a valid cache key', () => {
            const series = seriesFactory();
            const result = series.tvdbCacheKey();
            expect(result).toBe(`/${Constants.CACHE_FOLDERS.TVDB}/${series.tvdbId}.json`);
        });
    });
});