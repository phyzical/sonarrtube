import { Series } from '@sonarrTube/models/api/sonarr/Series';

export const generateSeries = (): Series => {
    const payload = {} as SeriesType;
    return new Series(payload);
};

describe('Series', () => {
    it('TODO:', () => {
        Series;
    });
});