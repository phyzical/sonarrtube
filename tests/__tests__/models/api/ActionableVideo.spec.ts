import { writeFileSync } from 'fs';

import { actionableVideoFactory } from '@sonarrTube/factories/models/api/ActionableVideo';
import { seriesFactory as TvdbSeriesFactory } from '@sonarrTube/factories/models/api/tvdb/Series';
import { seriesFactory as SonarrSeriesFactory } from '@sonarrTube/factories/models/api/sonarr/Series';
import { channelFactory } from '@sonarrTube/factories/models/api/youtube/Channel';
import { ActionableVideo } from '@sonarrTube/models/api/ActionableVideo';

describe('ActionableVideo', () => {
    describe('constructor', () => {
        it('should create an instance of ActionableVideo', () => {
            expect(actionableVideoFactory()).toBeInstanceOf(ActionableVideo);
        });
    });
    describe('unDownloaded', () => {
        it('should return false if sonarrEpisode is missing', () => {
            const sonarrSeries = SonarrSeriesFactory({ episodes: [undefined] });
            const actionableVideo = actionableVideoFactory(0, { sonarrSeries });
            expect(actionableVideo.unDownloaded()).toBe(false);
        });

        it('should return false if youtube is missing', () => {
            const youtubeContext = channelFactory({ videos: [undefined] });
            const actionableVideo = actionableVideoFactory(0, { youtubeContext });
            expect(actionableVideo.unDownloaded()).toBe(false);
        });

        it('should return false if sonarrEpisode has a file', () => {
            const actionableVideo = actionableVideoFactory(0, { sonarrEpisode: { hasFile: true } });
            expect(actionableVideo.unDownloaded()).toBe(false);
        });

        it('should return true if sonarrEpisode missing a file', () => {
            const actionableVideo = actionableVideoFactory(0, { sonarrEpisode: { hasFile: false } });
            console.log(actionableVideo);
            expect(actionableVideo.unDownloaded()).toBe(true);
        });
    });
    describe('missingFromTvdb', () => {
        it('should return false if tvdbEpisode is present', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.missingFromTvdb()).toBe(false);
        });
        it('should return true if tvdbEpisode is missing', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [undefined] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });

            expect(actionableVideo.missingFromTvdb()).toBe(true);
        });
    });
    describe('missingYoutube', () => {
        it('should return false if youtubeVideo is present', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.missingYoutube()).toBe(false);
        });
        it('should return true if youtubeVideo is missing', () => {
            const youtubeContext = channelFactory({ videos: [undefined] });
            const actionableVideo = actionableVideoFactory(0, { youtubeContext });
            expect(actionableVideo.missingYoutube()).toBe(true);
        });
    });
    describe('missingProductionCode', () => {
        it('should return false if tvdbEpisode is missing', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [undefined] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(actionableVideo.missingProductionCode()).toBe(false);
        });
        it('should return false if tvdbEpisode has a production code', () => {
            const actionableVideo = actionableVideoFactory(0, { tvdbEpisode: { productionCode: '123' } });
            expect(actionableVideo.missingProductionCode()).toBe(false);
        });
        it('should return true if tvdbEpisode does not have a production code', () => {
            const actionableVideo = actionableVideoFactory(0, { tvdbEpisode: { productionCode: undefined } });
            expect(actionableVideo.missingProductionCode()).toBe(true);
        });
    });
    describe('tvdbEditUrl', () => {
        it('should return null', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [undefined] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(actionableVideo.tvdbEditUrl()).toBe(undefined);
        });
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.tvdbEditUrl()).toBeString();
            expect(actionableVideo.tvdbEditUrl())
                .toBe(actionableVideo.tvdbEpisode?.editURL());
        });
    });
    describe('tvdbInfoCache', () => {
        it('should return null', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [undefined] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(actionableVideo.tvdbInfoCache()).toBe(undefined);
        });
        it('should return a cache key', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.seriesId = 1;
                actionableVideo.tvdbEpisode.id = 2;
            }

            expect(actionableVideo.tvdbInfoCache()).toContain('/tvdb/1/2.json');
        });
    });
    describe('thumbnailCacheFile', () => {
        it('should throw', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [undefined] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(() => actionableVideo.thumbnailCacheFile()).toThrow('Episode not found this shouldn\'t happen!');
        });
        it('should return a cache key', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.seriesId = 1;
            }
            expect(actionableVideo.thumbnailCacheFile()).toContain('/tvdb/1/thumbnails.txt');
        });
    });
    describe('thumbnailUploadAttemptCount', () => {
        it('should return 0 when cache doesn\t exist', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(0);
        });
        it('should throw', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [undefined] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(() => actionableVideo.thumbnailUploadAttemptCount())
                .toThrow('Episode not found this shouldn\'t happen!');
        });

        it('should return the correct count', () => {
            const actionableVideo = actionableVideoFactory();
            if (actionableVideo.tvdbEpisode) {
                actionableVideo.tvdbEpisode.seriesId = 1;
                actionableVideo.tvdbEpisode.id = 2;
            }
            const cachePath = actionableVideo.thumbnailCacheFile();
            writeFileSync(cachePath, [1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 5, 6, 7].join('\n'));
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(3);
        });
    });
    describe('addThumbnailUploadAttempt', () => {
        it('should throw', () => {
            const tvdbSeries = TvdbSeriesFactory({ episodes: [undefined] });
            const actionableVideo = actionableVideoFactory(0, { tvdbSeries });
            expect(() => actionableVideo.addThumbnailUploadAttempt())
                .toThrow('Episode not found this shouldn\'t happen!');
        });
        it('should increment the count', () => {
            const actionableVideo = actionableVideoFactory();
            actionableVideo.addThumbnailUploadAttempt();
            actionableVideo.addThumbnailUploadAttempt();
            actionableVideo.addThumbnailUploadAttempt();
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(3);
        });
    });
    describe('season', () => {
        it('should return a season', () => {
            const actionableVideo = actionableVideoFactory(0, { sonarrEpisode: { seasonNumber: 1 } });
            expect(actionableVideo.season()).toBe(1);
        });
    });
    describe('aired', () => {
        it('should return an aired date', () => {
            const actionableVideo = actionableVideoFactory(0, { youtubeVideo: { upload_date: '20200101' } });
            expect(actionableVideo.aired()).toBe('2020-01-01');
        });
    });
    describe('youtubeURL', () => {
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory(0, { tvdbEpisode: { productionCode: '123' } });
            expect(actionableVideo.youtubeURL()).toBe('');
        });
    });
    describe('summary', () => {
        it('should return a summary', () => {
            const actionableVideo = actionableVideoFactory(0, { youtubeVideo: { description: 'description' } });
            expect(actionableVideo.summary()).toBe('description');
        });
    });
    describe('youtubeSearchURL', () => {
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory(0, { youtubeVideo: { title: 'title' } });
            expect(actionableVideo.youtubeSearchURL()).toBe('https://www.youtube.com/results?search_query=title');
        });
    });
    describe('youtubeChannelSearchURL', () => {
        it('should return a URL', () => {
            const actionableVideo = actionableVideoFactory(0, { youtubeVideo: { channel: 'channel' } });
            expect(actionableVideo.youtubeChannelSearchURL())
                .toBe('https://www.youtube.com/results?search_query=channel');
        });
    });
    describe('seriesName', () => {
        it('should return a name', () => {
            const actionableVideo = actionableVideoFactory(0, { youtubeVideo: { channel: 'channel' } });
            expect(actionableVideo.seriesName()).toBe('channel');
        });
    });
    describe('name', () => {
        it('should return a name', () => {
            const actionableVideo = actionableVideoFactory(0, { youtubeVideo: { title: 'title' } });
            expect(actionableVideo.name()).toBe('title');
        });
    });
    describe('tvdbContextFromYoutube', () => {
        it('should return a context', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.tvdbContextFromYoutube()).toBe(actionableVideo);
        });
    });
    describe('clearCache', () => {
        it('should clear the cache', () => {
            const actionableVideo = actionableVideoFactory();
            actionableVideo.clearCache();
            expect(actionableVideo.thumbnailUploadAttemptCount()).toBe(0);
        });
    });
    describe('generateSonarrEpisode', () => {
        it('should generate an episode', () => {
            const actionableVideo = actionableVideoFactory();
            expect(actionableVideo.generateSonarrEpisode('1')).toBe(actionableVideo.sonarrEpisode);
        });
    });
});